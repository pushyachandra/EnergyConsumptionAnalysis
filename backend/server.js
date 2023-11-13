const dotenv = require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require("cors");
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');
const { exec } = require('child_process');

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
    console.log(req.query);

    const email = req.query.email;
    const password = req.query.password;

    const query= "select count(*) as cnt from users where email='"+email+"' and password='"+password+"';"
    
    console.log(query);

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

app.post('/api/process-files', (req, res) => {
    const { email,file_name } = req.body;

    // Construct the command with the email parameter
    const pythonCommand = `python ..//services/process_data.py --email ${email} --file ${file_name}`;

    exec(pythonCommand, (error, stdout, stderr) => {
        if (error) {
            console.error(`exec error: ${error}`);
            return res.status(500).send('Error processing files');
        }
        console.log(`stdout: ${stdout}`);
        console.error(`stderr: ${stderr}`);
        res.send('Files processed successfully');
    });
});

app.get('/', (req, res) => {
    res.send('Hello World!')
  })

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})