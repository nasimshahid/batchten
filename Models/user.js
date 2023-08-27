const mongoose = require("mongoose");

const objectId = mongoose.Schema.ObjectId;
const productSchema = new mongoose.Schema({
  userId: { type: objectId, ref: "register" },
  name: String,
  adress: String,
  mobileNo: Number,
  dateOfBith: String,
});
module.exports = mongoose.model("products", productSchema);
