const express = require("express");
const app = express();

app.use(express.json());

app.get('/',(reqq,res)=>{
    res.json({message: "Grant Application Review API is running"});
});

const PORT = 5000;
app.listen(PORT,()=>{
    console.log(`Server running on port: ${PORT}`);
})