const dotenv = require('dotenv').config();
const express = require('express');
const mysql = require('mysql');
const cors = require("cors");

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
            // console.log()
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

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})