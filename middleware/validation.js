const joi = require('joi');


exports.clientReg = (req, res, next) => {
    const schema = joi.object({
        firstName: joi.string().trim().pattern(/^[A-Za-z\s-]{3,}$/).required().messages({
            'any.required': 'Firstname is required',
            'string.empty': 'Firstname cannot be empty',
            'string.pattern.base': 'Firstname cannot contain numbers and must be at least 4 characters'
        }),
        lastName: joi.string().trim().pattern(/^[A-Za-z\s-]{3,}$/).required().messages({
            'any.required': 'Lastname is required',
            'string.empty': 'Lastname cannot be empty',
            'string.pattern.base': 'Lastname cannot contain numbers and must be at least 4 characters'
        }),
        email: joi.string().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
        }),
        password: joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.#^()_\-+=])[A-Za-z\d@$!%*?&.#^()_\-+=]{8,}$/).required().messages({
            'any.required': 'Password is required',
            'string.empty': 'Password cannot be empty',
            'string.pattern.base': 'Password must be atleast 8 characters and must include at least one uppercase, one lowercase, one digit and one special character'
        })
    })

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        console.log(error.details[0])
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}


exports.verifyOtpReg = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
        }),
        otp: joi.string().pattern(/^\d{6}$/).required().messages({
            'any.required': 'otp is required',
            'string.empty': 'otp cannot be empty',
            'string.pattern.base': 'otp must only contain numbers and must be 6 digits'
        }),
    })

    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        console.log(error.details[0])
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}


exports.resendOtpReg = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
        })
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        console.log(error.details[0])
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}


exports.loginReg = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
        }),
        password: joi.string().pattern(/^(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': 'Password is required',
            'string.empty': 'Password cannot be empty',
            'string.pattern.base': 'Password must be at least 8 characters and must include 1 uppercase and 1 lowercase'
        }),
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
        console.log(error.details[0])
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}
