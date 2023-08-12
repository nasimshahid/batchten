const express = require("express");
const app = express();
const cors = require("cors");
const loger = require("morgan");
require("./db/config");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const secretKey = "sahaid";
var jwt = require("jsonwebtoken");
const register = require("./Models/Register");
app.use(express.json());
app.use(loger("dev"));
app.use(cors());

// Signup Api
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const isExist = await register.findOne({ email: email });
  if (isExist) {
    return res.send({ result: "User Already Exist", code: 300 });
  } else {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        const data = {
          name: name,
          email: email,
          password: hash,
        };  
        let users = new register(data);
        let result = await users.save();
        if (result) {
          res.send({ result: "Register SuccessFully", code: 200 });
        }
      });
    });
  }});
// Login Api
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const isExist = await register.findOne({ email: email }); 
  if (isExist) {
    bcrypt.compare(password, isExist.password,async function (err, result) {
      if (result) {
        const token = jwt.sign({ data: isExist._id }, secretKey, {
          expiresIn: 60 * 60,
        });
        isExist.token=token
        await isExist.save()
        res.send({ result: "Login SuccessFully", token: token });
      } else {
        res.send({ result: "password not match" });
      }
    });
  } else {
    res.send({ result: "User Not Found" });
  }
});

app.post("/profile", verifyToken, (req, res) => {
    
  res.send("profile");
});

async function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

//   console.log("request",req);
  const {email}=req.body

  console.log("tokeno",token);
  if (token) {
    console.log("token1",token);
    const validToken= token.split(" ")[1];
    console.log("token3",validToken);
// console.log("token",validToken);
    jwt.verify(validToken , secretKey, async(err, result) => {
        console.log("res",result)
      if (err) {
        res.send({ result: "please provide valid token"});
        console.log("err",err)
      }else{
    // res.send({result:result})
  const userVerify= await register.findOne({email:email})
  console.log("user",userVerify);
  if (userVerify._id.toString()===result.data) {
    // console.log("1",userVerify._id.toString());
    next()
  }else{
    res.send({result:"User Id Not Match"})
    console.log("match",userVerify._id);
  } 
      }
    });
  }else{
    res.send({result:"add token with Headers"})
  }
}

app.listen(3000);
