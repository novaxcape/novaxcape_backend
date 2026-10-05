const swagger = require('swagger-jsdoc');

const options = {
    definition:{
        openapi:"3.0.0",
        info:{
            title: "Novaxcape",
            version: "1.0.0",
            description: "swagger documentation"
        },
        servers:[
            {
                url:"https://novaxcape-backend.onrender.com",
                description: "The hosted route"
            },
        {

                url:"http://localhost:3030",
                description: 'hosted URL'
        }
        ],
        components:{
        securitySchemes:{
            bearerAuth:{
                type: "http",
                scheme: "bearer",
                bearerFormat: "JWT"
            }
        }
    }
    },
    apis: [
      "./docs/client.yaml"
    ]
}

module.exports =swagger(options)
