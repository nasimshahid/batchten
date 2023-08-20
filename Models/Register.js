const mongoose=require("mongoose")

const RegSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    otp:Number,
})
module.exports =mongoose.model("register",RegSchema)