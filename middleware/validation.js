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
        otp: joi.string().pattern(/^\d{6}$/).required().messages({
            'any.required': 'otp is required',
            'string.empty': 'otp cannot be empty',
            'string.pattern.base': 'otp must only contain numbers and must be 6 digits'
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


exports.resetPasswordValidator = (req, res, next) => {
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
        })
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    // console.log(error.details[0])
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}


exports.forgotPasswordValidator = (req, res, next) => {
    const schema = joi.object({
        email: joi.string().email().required().messages({
            'any.required': 'Email is required',
            'string.empty': 'Email cannot be empty',
            'string.email': 'Email must be a valid email'
        })
    })
    const { error } = schema.validate(req.body, { abortEarly: false });
    // console.log(error.details[0])
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}


exports.updateProfile = (req, res, next) => {
    const schema = joi.object({
        userName: joi.string().pattern(/^[A-Za-z\s]{3,}$/).required().messages({
            'any.required': 'username is required',
            'string.empty': 'username cannot be empty',
            'string.pattern.base': 'username cannot contain numbers and must be at least 4 characters'
        }),
        profilePictue: joi.optional()
    })

    const { error } = schema.validate(req.body, { abortEarly: false });
    // console.log(error.details[0])
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}


exports.changePasswordValidator = (req, res, next) => {
    const schema = joi.object({
        oldPassword: joi.string().pattern(/^(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': 'old password is required',
            'string.empty': 'old password cannot be empty',
            'string.pattern.base': 'old password must be at least 8 characters and must include 1 uppercase and 1 lowercase'
        }),
        newPassword: joi.string().pattern(/^(?=.*[A-Z]).{8,}$/).required().messages({
            'any.required': 'new password is required',
            'string.empty': 'new password cannot be empty',
            'string.pattern.base': 'new password must be at least 8 characters and must include 1 uppercase and 1 lowercase'
        }),
        confirmPassword: joi.string().required().valid(joi.ref('newPassword')).messages({
            'any.only': 'confirm password must match New password',
            'any.required': 'confirm password is required'
        })
    })

    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
        return res.status(400).json({
            message: error.details[0].message
        })
    }

    next()
}
