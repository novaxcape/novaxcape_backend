require('dotenv').config()
const express = require('express');
const PORT = process.env.PORT
const cookieParser = require('cookie-parser')


const route = require('./routes/client')

const app = express();
app.use(express.json());
app.use(cookieParser())


app.use('/api/v1/client', route)

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log('Database is connected');
    app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})
}).catch((error)=>{
    console.log('Unable to connect:', error.message);
    
})
