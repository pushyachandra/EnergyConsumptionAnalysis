const dotenv = require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require("cors");
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { exec } = require('child_process');
const moment = require('moment-timezone');

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



app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})