const dotenv = require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require("cors");
const axios = require('axios');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { exec } = require('child_process');
const moment = require('moment-timezone');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');
const fastcsv = require('fast-csv');
const { Parser } = require('json2csv');

const app = express();
app.use(express.json());
const port = process.env.BACKEND_PORT;

const corsOptions = {
    origin: process.env.FRONTEND_ORIGIN,
    credentials: true,
    optionSuccessStatus: 200
};

app.use(cors(corsOptions));

const db= mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

app.get("/api/getUsers", (req,res)=>{
    const query="select email,password from users;"
    db.query(query,(error,result)=>{
        res.send(JSON.stringify(result));
    });
});

app.post("/api/signUpUser",(req,res)=>{
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const password = req.body.password;
    
    const query= "insert into users (first_name,last_name,email,password) values ('"+
                    firstName+"','"+lastName+"','"+email+"','"+password+"');"
    
    db.query(query,(error,result)=>{
        if(error==null){
            res.send("ok");
        }
        else{
            if(error.code="ER_DUP_ENTRY"){
                res.send("Please use a different Email.\nThe mail '"+email+"' is already in use.")
            }
            else{
                res.send("An error has occured");
                console.log(error)
            }
        }
    });
});

app.get('/api/loginUser', (req,res) => {
    // console.log(req.query);

    const email = req.query.email;
    const password = req.query.password;

    const query= "select count(*) as cnt from users where email='"+email+"' and password='"+password+"';"
    
    // console.log(query);

    db.query(query,(error,result)=>{
        if(error==null){
            if(result[0].cnt===1){
                res.send("ok")
            }
            else{
                res.send("no")
            }
        }
        else{
            res.send("An error has occured");
            console.log(error)
        }
    });
})

const storage = new Storage({ keyFilename: 'credentials.json' });
const bucket = storage.bucket(process.env.GOOGLE_BUCKET_NAME);
const upload = multer({ storage: multer.memoryStorage() });

app.post('/api/upload', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.');
    }

    // Extract user data from the request body
    const { email } = req.body;

    // Upload file to Google Cloud Storage
    const blob = bucket.file(req.file.originalname);
    const blobStream = blob.createWriteStream();

    blobStream.on('error', err => {
        console.error(err);
        return res.status(500).send('Error uploading file');
    });

    blobStream.on('finish', () => {
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
        const uploadTime = new Date().toISOString().slice(0, 19).replace('T', ' ');

        const query = `
            INSERT INTO user_data_tracker (email, file_name, upload_time, file_name_raw)
            VALUES (?, ?, ?, ?)
        `;
        const values = [email, blob.name, uploadTime, req.file.originalname];

        db.query(query, values, (dbError, results) => {
            if (dbError) {
                console.error('Database error:', dbError);
                return res.status(500).send('Error updating database');
            }
            res.status(200).send({ message: 'File uploaded and database updated', url: publicUrl });
        });
    });

    blobStream.end(req.file.buffer);
});

app.get('/api/data', (req, res) => {
    const { start, end, type } = req.query;

    // Convert UTC dates to Pacific Time and format to date-only strings
    const localStart = moment(start).tz('America/Los_Angeles').format('YYYY-MM-DD');
    const localEnd = moment(end).tz('America/Los_Angeles').format('YYYY-MM-DD');

    // console.log(`Querying from ${localStart} to ${localEnd}`);

    let selectField = type === 'usage' ? 'units' : 'cost';
    const query = `SELECT date,start_time, ${selectField} AS value FROM upload_testing WHERE date >= ? AND date <= ?`;

    db.query(query, [localStart, localEnd], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).send('Error fetching data');
        }

        // console.log('Query results:', results);

        let data = {
            Morning: 0,
            Afternoon: 0,
            Evening: 0,
            Night: 0
        };

        results.forEach(row => {
            const hour = parseInt(row.start_time.split(':')[0]); // Assuming start_time format is 'HH:MM'

            if (hour >= 6 && hour < 12) {
                data.Morning += parseFloat(row.value);
            } else if (hour >= 12 && hour < 16) {
                data.Afternoon += parseFloat(row.value);
            } else if (hour >= 16 && hour < 20) {
                data.Evening += parseFloat(row.value);
            } else {
                data.Night += parseFloat(row.value);
            }
        });

        res.json(data);
    });
});

app.get('/api/available-dates', (req, res) => {
    const query = 'SELECT DISTINCT date FROM upload_testing';
    db.query(query, (error, results) => {
        if (error) {
            return res.status(500).send('Error fetching available dates');
        }
        const availableDates = results.map(result => result.date); // Assuming 'date' is the column name
        res.json(availableDates);
    });
});

app.get('/api/bar-data', (req, res) => {
    const { start, end, type } = req.query;
    let selectField = type === 'usage' ? 'units' : 'cost';

    const localStart = moment(start).tz('America/Los_Angeles').format('YYYY-MM-DD');
    const localEnd = moment(end).tz('America/Los_Angeles').format('YYYY-MM-DD');

    const query = `SELECT date, start_time, ${selectField} AS value FROM upload_testing  WHERE date >= ? AND date <= ?`;

    db.query(query, [localStart, localEnd], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).send('Error fetching data');
        }

        const barData = {};

        results.forEach(row => {
            const date = row.date;
            const hour = parseInt(row.start_time.split(':')[0]);
            let timeOfDay;

            if (hour >= 6 && hour < 12) {
                timeOfDay = 'Morning';
            } else if (hour >= 12 && hour < 16) {
                timeOfDay = 'Afternoon';
            } else if (hour >= 16 && hour < 20) { // Adjusted condition for 'Evening'
                timeOfDay = 'Evening';
            } else {
                timeOfDay = 'Night'; // Adjusted condition for 'Night'
            }

            barData[date] = barData[date] || { Morning: 0, Afternoon: 0, Evening: 0, Night: 0 };
            barData[date][timeOfDay] += parseFloat(row.value);
        });

        res.json(barData);
    });
});

app.get('/api/scatter-data', (req, res) => {
    const { start, end } = req.query;

    const startDate = new Date(start).toISOString().split('T')[0];
    const endDate = new Date(end).toISOString().split('T')[0];

    const query = `SELECT date, units, cost, start_time FROM upload_testing WHERE date >= ? AND date <= ?`;

    db.query(query, [startDate, endDate], (error, results) => {
        if (error) {
            console.error('Database query error:', error);
            return res.status(500).send('Error fetching scatter data');
        }

        const scatterData = results.map(row => {
            const hour = new Date(`1970-01-01T${row.start_time}`).getHours();
            let timeOfDay;

            if (hour >= 6 && hour < 12) {
                timeOfDay = 'Morning';
            } else if (hour >= 12 && hour < 16) {
                timeOfDay = 'Afternoon';
            } else if (hour >= 16 && hour < 20) {
                timeOfDay = 'Evening';
            } else {
                timeOfDay = 'Night';
            }

            return {
                units: row.units,
                cost: row.cost,
                date: row.date,
                timeOfDay: timeOfDay
            };
        });

        res.json(scatterData);
    });
});

app.get('/api/heatmap-data', (req, res) => {
    const { type, start, end } = req.query; // 'type' is 'units' or 'cost'
    let selectField = type === 'usage' ? 'units' : 'cost';
    const startDate = new Date(start).toISOString().split('T')[0];
    const endDate = new Date(end).toISOString().split('T')[0];

    // Aggregate data by hour
    // Extract the hour from start_time and sum up the 'units' or 'cost' for each hour of each day
    const query = `
        SELECT 
            date, 
            HOUR(start_time) as hour, 
            SUM(${selectField}) as value 
        FROM upload_testing 
        WHERE date >= ? AND date <= ?
        GROUP BY date, hour
    `;

    db.query(query, [startDate, endDate], (error, results) => {
        if (error) {
            console.error('Error in /api/heatmap-data:', error);
            res.status(500).send('Internal Server Error');
            return;
        }

        res.json(results);
    });
});

// app.post('/chat', (req, res) => {
//     const userMessage = req.body.message;

//     let responseMessage = "I'm not sure what you mean.";
//     if (userMessage.toLowerCase().includes("hi")) {
//         responseMessage = "Hello! How can I help you today?";
//     }

//     res.json({ message: responseMessage });
// });

app.post('/chat', async (req, res) => {
    const userMessage = req.body.message;
    const intent = detectIntent(userMessage);

    if (intent === 'ROUTE') {
        // If the intent is to navigate, respond with 'ROUTE'
        return res.json({ message: 'ROUTE' });
    } else if (intent === 'DATA') {
        // If the intent is to get data, proceed with the summary
        try {
            const summaryData = await getDataSummary();
            const openAiResponse = await openAiSummary(userMessage, summaryData);
            res.json({ message: openAiResponse });
        } catch (error) {
            console.error('Error processing data summary:', error);
            res.status(500).send('Error processing data summary');
        }
    } else if (intent === 'DOWNLOAD') {
        // If the intent is to download data, provide a download link
        // You need to extract dates from userMessage to implement the download logic
        const { start, end } = extractDates(userMessage); // Implement this function based on your requirements
        if (start && end) {
            const downloadLink = `/download-data?startDate=${start}&endDate=${end}`;
            return res.json({ message: 'DOWNLOAD', startDate:start, endDate:end });
        } else {
            return res.json({ message: "I couldn't find the dates you mentioned. Could you please provide the start and end dates for the download?" });
        }
    } else {
        // If the intent is not recognized, ask the user for clarification
        res.json({ message: "I'm not sure what you're asking for. Can you please clarify if you want to navigate the website, need information on data, or wish to download something?" });
    }
});

app.get('/download-data', (req, res) => {
    const { startDate, endDate } = req.query;
    
    const query = 'SELECT DATE_FORMAT(date, "%Y-%m-%d") AS date, start_time, end_time, units, cost FROM upload_testing WHERE date BETWEEN ? AND ?';
    
    db.query(query, [startDate, endDate], (error, results) => {
      if (error) {
        console.error('Database query error:', error);
        return res.status(500).send('Error fetching data');
      }
  
      try {
        // Convert results to CSV
        const json2csvParser = new Parser();
        const csvData = json2csvParser.parse(results);
  
        // Set headers to prompt download with a filename
        res.header('Content-Type', 'text/csv');
        res.attachment(`data_${startDate}_${endDate}.csv`);
        res.send(csvData);
      } catch (err) {
        console.error('Error parsing CSV:', err);
        return res.status(500).send('Error processing data');
      }
    });
  });

const extractDates = (message) => {
    // Regex pattern to match YYYY-MM-DD and MM/DD/YYYY formats
    const datePatterns = [
        /from (\d{4}-\d{2}-\d{2}) to (\d{4}-\d{2}-\d{2})/, // Matches YYYY-MM-DD to YYYY-MM-DD
        /from (\d{2}\/\d{2}\/\d{4}) to (\d{2}\/\d{2}\/\d{4})/, // Matches MM/DD/YYYY to MM/DD/YYYY
        // Add more patterns as needed
    ];

    for (const pattern of datePatterns) {
        const match = message.match(pattern);
        if (match) {
            // Convert to a standard format if necessary, e.g., from MM/DD/YYYY to YYYY-MM-DD
            const startDate = convertToDate(match[1]);
            const endDate = convertToDate(match[2]);
            if (startDate && endDate) {
                return { start: startDate, end: endDate };
            }
        }
    }
    return null;
};

const convertToDate = (dateString) => {
    // Check if date is in MM/DD/YYYY format and convert to YYYY-MM-DD
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
        const parts = dateString.split('/');
        return `${parts[2]}-${parts[0]}-${parts[1]}`; // Assuming the format is MM/DD/YYYY
    }
    // If date is already in YYYY-MM-DD format, return as is
    else if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
        return dateString;
    }
    // If the date string does not match expected formats, return null
    return null;
};

const downloadData = (startDate, endDate) => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT date, start_time, end_time, units, cost FROM upload_testing WHERE date BETWEEN ? AND ?';
        
        db.query(query, [startDate, endDate], (error, results) => {
            if (error) {
                return reject(error);
            }

            // Format the 'date' column in the results
            const formattedResults = results.map(row => ({
                ...row,
                date: format(new Date(row.date), 'yyyy-MM-dd') // format date to 'YYYY-MM-DD'
            }));

            // Ensure there's a directory to save the file
            const dirPath = path.join(__dirname, 'downloads');
            if (!fs.existsSync(dirPath)){
                fs.mkdirSync(dirPath);
            }

            // Format the dates for the file name
            const formattedStartDate = format(new Date(startDate), 'yyyyMMdd');
            const formattedEndDate = format(new Date(endDate), 'yyyyMMdd');
            
            // Set the path for the CSV file
            const filePath = path.join(dirPath, `data_${formattedStartDate}_to_${formattedEndDate}.csv`);

            // Create a writable stream and use fast-csv to format and write the data
            const ws = fs.createWriteStream(filePath);
            fastcsv
                .write(formattedResults, { headers: true })
                .on('finish', () => {
                    resolve(filePath);
                })
                .pipe(ws);
        });
    });
};

// Export the function if necessary
module.exports = {
    downloadData,
};

const getDataSummary = async () => {
    return new Promise((resolve, reject) => {
        const query = 'SELECT date, SUM(units) AS total_units, SUM(cost) AS total_cost FROM upload_testing GROUP BY date';
        
        db.query(query, (error, results) => {
            if (error) {
                return reject(error);
            }
            
            // Process results to create a summary text
            const summary = results.map(row => 
                `On ${row.date}, a total of ${row.total_units} units were used, costing a total of $${row.total_cost.toFixed(2)}.`
            ).join(' ');
            
            resolve(summary);
        });
    });
};

// const openAiSummary = async (msg, summaryData) => {
//     let contextMessage = { role: "system", content: "From the previouly entered information answer the questions asked by the user" };
//     let userMessage = { role: "user", content: msg };
    
//     try {
//         const response = await axios.post('https://api.openai.com/v1/chat/completions', {
//             model : 'gpt-3.5-turbo',
//             max_tokens: 150,
//             temperature: 0.5,
//             messages: [contextMessage, userMessage],
//         }, {
//             headers: {
//                 'Authorization': `Bearer ${process.env.API_KEY}`
//             }
//         });
//         console.log(response.data.choices[0].message.content)
//         return response.data.choices[0].message.content;
//     } catch (error) {
//         if (error.response) {
//             console.error('OpenAI API responded with:', error.response.status, error.response.data);
//         }
//         throw error;
//     }
// };

let conversationHistory = [];

const detectIntent = (message) => {
    const navigationKeywords = ['navigate', 'go to', 'visit', 'show me', 'route'];
    const dataKeywords = ['summary', 'summarize', 'information', 'give me'];
    const downloadKeywords = ['download', 'export', 'save', 'file'];

    if (navigationKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        return 'ROUTE';
    } else if (dataKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        return 'DATA';
    } else if (downloadKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
        return 'DOWNLOAD';
    }
    return null;  // Intent not recognized
};

const openAiSummary = async (msg, summaryData) => {
    // Add system context message only once at the beginning or when resetting the conversation
    if (conversationHistory.length === 0) {
        conversationHistory.push({
            role: "system",
            content: "The following is a summary of energy usage data: " + summaryData
        });
    }
    // Add user message to the conversation history
    conversationHistory.push({
        role: "user",
        content: msg
    });

    try {
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model: 'gpt-3.5-turbo',
            max_tokens: 150,
            temperature: 0.5,
            messages: conversationHistory,
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.API_KEY}`
            }
        });

        // Extract the AI message and add it to the conversation history
        const aiMessage = response.data.choices[0].message.content;
        conversationHistory.push({
            role: "assistant",
            content: aiMessage
        });
        return aiMessage;
    } catch (error) {
        if (error.response) {
            console.error('OpenAI API responded with:', error.response.status, error.response.data);
        }
        throw error;
    }
};

// Function to reset the conversation history
const resetConversation = () => {
    conversationHistory = [];
};

// Function to get the current conversation history (for example, to display in the UI)
const getConversationHistory = () => {
    return conversationHistory;
};

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})