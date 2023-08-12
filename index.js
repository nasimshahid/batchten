const express = require("express");
const app = express();
const cors = require("cors");
const loger = require("morgan");
require("./db/config");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const secretKey = "sahaid";
const register = require("./Models/Register");
app.use(express.json());
app.use(loger("dev"));
app.use(cors());
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  const isExist = await register.findOne({ email: email });
  if (isExist) {
    res.send({result:"User Already Exist", code:204});
  } else {
    bcrypt.genSalt(saltRounds, function (err, salt) {
        bcrypt.hash(password, salt ,async function (err, hash) {
          let users = new register({
            name:name,
            email:email,
            password:hash
          });
          let result = await users.save();
          if (result) {
            res.send({result:"Register SuccessFully",code:200});
          }        
        });
    });
    
  }
});
app.listen(3000);
