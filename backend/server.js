const dotenv = require('dotenv').config();
const express = require('express');
const mysql = require('mysql');

const app = express();
const port = process.env.BACKEND_PORT;

const db= mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME
});

app.get("/api/getUsers", (req,res)=>{
  const query="select username,password from users;"
  db.query(query,(error,result)=>{
      res.send(JSON.stringify(result));
  });
});

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})