require('dotenv').config()
const express = require('express');
const app = express();
app.use(express.json());

const PORT = process.env.PORT

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log('Database is connected');
    app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
}).catch((error)=>{
    console.log('Unable to connect:', error.message);
    
})