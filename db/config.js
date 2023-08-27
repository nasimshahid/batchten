const mongoose =require ("mongoose")

mongoose.connect('mongodb://127.0.0.1:27017/todo',{ useNewUrlParser: true,useUnifiedTopology: true }).then(()=>{
console.log("DB Connected");
}).catch((err)=>{
console.log(err);
})