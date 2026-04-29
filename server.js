const express=require("express");
const mysql=require("mysql2");
const cors=require("cors");
const app=express();
app.use(cors());
app.use(express.json());
const db=mysql.createConnection({
  host:"localhost",
  user:"root",
  password:"//pass",   
  database:"smart_route"});
db.connect(err=>{
  if(err){
    console.log("DB Connection Error:",err);
    return;  }
  console.log("MySQL Connected");});
app.get("/",(req,res)=>{
  res.send("Server running");});
app.get("/cities",(req,res)=>{
  db.query("SELECT*FROM cities ORDER BY id",(err,result)=>{
    if(err){
      console.log(err);
      return res.send(err);}
    res.json(result);});});
app.get("/routes",(req,res)=>{
  db.query("SELECT*FROM routes",(err,result)=>{
    if (err) {
      console.log(err);
      return res.send(err);}
    res.json(result);});});
app.listen(3000,()=>{console.log("Server started on port 3000");});
