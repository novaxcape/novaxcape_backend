require('dotenv').config()
const express = require('express');
const PORT = process.env.PORT || 3030
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express')
const swagger = require('./swagger')
const cors = require('cors')


const route = require('./routes/client')

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin: (origin, callback) => {
        const allowedOrigins = new Set([
            process.env.FRONTEND_URL,
            'http://localhost:3030',
            'http://127.0.0.1:3030',
            'https://novaxcape-backend.onrender.com'
        ].filter(Boolean));

        callback(null, !origin || allowedOrigins.has(origin));
    },
    credentials: true
}))


app.use('/apisDocs', swaggerUi.serve, swaggerUi.setup(swagger))

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
