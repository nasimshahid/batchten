const express = require("express");
const app = express();
const cors = require("cors");
const loger = require("morgan");
const User = require("./Models/user");
require("./db/config");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const nodemailer = require("nodemailer");
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
          res.send({ message: "Register SuccessFully", code: 200 });
        }
      });
    });
  }
});
// Login Api
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const isExist = await register.findOne({ email: email });
  if (isExist) {
    bcrypt.compare(password, isExist.password, async function (err, result) {
      if (result) {
        const token = jwt.sign({ data: isExist._id }, secretKey, {
          expiresIn: 60 * 60,
        });
        isExist.token = token;
        await isExist.save();
        res.send({
          statusCode: 200,
          result: "Login SuccessFully",
          token: token,
          user: isExist,
        });
      } else {
        res.send({ statusCode: 300, result: "password not match" });
      }
    });
  } else {
    res.send({ statusCode: 404, result: "User Not Found" });
  }
});

app.post("/profile", verifyToken, (req, res) => {
  res.send("profile");
});
// Token Verify

async function verifyToken(req, res, next) {
  const token = req.headers["authorization"];

  //   console.log("request",req);
  const { email } = req.body;

  console.log("tokeno", token);
  if (token) {
    console.log("token1", token);
    const validToken = token.split(" ")[1];
    console.log("token3", validToken);
    // console.log("token",validToken);
    jwt.verify(validToken, secretKey, async (err, result) => {
      console.log("res", result);
      if (err) {
        res.send({ result: "please provide valid token" });
        console.log("err", err);
      } else {
        // res.send({result:result})
        const userVerify = await register.findOne({ email: email });
        console.log("user", userVerify);
        if (userVerify._id.toString() === result.data) {
          // console.log("1",userVerify._id.toString());
          next();
        } else {
          res.send({ result: "User Id Not Match" });
          console.log("match", userVerify._id);
        }
      }
    });
  } else {
    res.send({ result: "add token with Headers" });
  }
}

// Mail Sent
app.post("/forgotPassword", async (req, res) => {
  const { email } = req.body;
  const isExistEmail = await register.findOne({ email: email });
  if (isExistEmail) {
    let otp = "";
    for (let i = 1; i <= 6; i++) {
      otp += Math.floor(Math.random() * 9);
    }
    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: "snasim1786@gmail.com",
        pass: "pmujgadapmriwrll",
      },
    });

    console.log("transport", transport);
    let mailDetails = {
      from: transport.options.auth.user,
      to: `${email}`,
      subject: "Test mail",
      text: ` Lorem ipsum dolor, sit amet consectetur adipisicing elit. Voluptate vitae ad esse fugiat eos quae beatae minima mollitia praesentium aliquam ${otp} `,
    };

    console.log("mailDetails", mailDetails);
    transport.sendMail(mailDetails, async function (err, data) {
      console.log("data", data);
      if (err) {
        res.send({ message: "Error Occurs" });
      } else {
        isExistEmail.otp = otp;
        await isExistEmail.save();
        res.send({ message: "Email sent successfully", errorCode:200,otpData:isExistEmail });
      }
    });
  } else {
    res.send({ message: "User Not Found",errorCode:404 });
  }
});

// optMatch

app.post("/otpMatch", async (req, res) => {
  const { otp, id } = req.body;
  // console.log("otpnew", otp);
  const isExistEmail = await register.findOne({ _id: id });
  console.log("otp", isExistEmail);
  if (isExistEmail) {
    if (isExistEmail?.otp == otp) {
      res.send({ message: "otp Match",errorCode:200 });
    } else {
      res.send({ message: "otp Not Match",errorCode:300 });
    }
  } else {
    res.send({ message: "User Not Found",errorCode:404 });
  }
});
// setPassword
app.post("/setPassword", async (req, res) => {
  const { id, password } = req.body;
  console.log("set", id);
  const userFound = await register.findOne({ _id: id });
  console.log("res", userFound);

  if (userFound) {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(password, salt, async function (err, hash) {
        let updatePassword = await register.updateOne(
          { _id: id },
          { $set: { password: hash } }
        );
        if (updatePassword) {
          res.send({message:"Update SuccessFully",errorCode:200});
        }
      });
    });
  } else {
    res.send({ message: "User Not Found",errorCode:404 });
  }
});

// Insert Users
app.post("/addUser", async (req, res) => {
  const { name, adress, mobileNo, dateOfBith, email } = req.body;

  // console.log(name,adress,mobileNo,dateOfBith);

  const isExist = await register.findOne({ email: email });

  console.log("isExist",isExist);
  if (isExist) {
    const profile = await User.create({
      userId: isExist._id,
      name: name,
      adress: adress,
      mobileNo: mobileNo,
      dateOfBith: dateOfBith,
    });
    console.log("profile",profile);
    if (profile) {
      return res.send({ message: "Profile Upload Success",code:200 });
    } else {
      return res.send({ message: "Error in Upload profile" });
    }
  } else {
    return res.send({ message: "User NoT Found" });
  }
})

// app.get("/getUser", async (req,res)=>{

//   const {email} = req.body;
  
//   const isExitUser =await register.findOne({email:email}) ;

//   if(isExitUser){

//   }









// })





app.listen(3000);
 
