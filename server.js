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
app.use(cors())


app.use('/apisDocs', swaggerUi.serve, swaggerUi.setup(swagger))

app.use('/api/v1/client', route)


app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return res.status(400).json({
            message: 'Invalid JSON body. Please check your request body syntax.'
        })
    }

    next(err)
})

app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found'
    })
})

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    res.status(500).json({
        message: err.message
    })
})

app.use((err, req, res, next) => {
    if (res.headersSent) {
        return next(err)
    }

    if (err.name === 'TokenExpireError') {
        return res.status(401).json({
            message:"Session expired: Please login to continue"
        })
    }

    if (err.name === 'MulterError') {
        return res.status(400).json({
            message: err.message
        })
    }

    console.log(err.message)
    res.status(500).json({
        message: 'Something went wrong'
    })
})


const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URL).then(()=>{
    console.log('Database is connected');
    app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
})
}).catch((error)=>{
    console.log('Unable to connect:', error.message);
    
})
