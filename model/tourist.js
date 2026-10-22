const mongoose = require("mongoose")

const touristSchema = new mongoose.Schema({
    vendorId: {
        type: mongoose.SchemaTypes.ObjectId,
        ref: 'vendor'
    },
    centreName: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    facilitiesAndAmenities: {
        type: [String],
        enum: [
            "Free WiFi",
            "Parking",
            "Restaurant",
            "Photography Allowed",
            "Nature Trails",
            "Water Activities",
            "Hiking",
            "Guided Tours"
        ],
        default: []
    },
    installmentsPayment: {
        type: Boolean,
        required: true
    },
    streetAddress: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    openingHours: {
        type: String,
        required: true
    },
    images: {
         secureUrl: {
        type: String,
        trim: true
        },
        publicId: {
       type: String,
        trim: true
        }
    },
    termsAndConditions: {
         secureUrl: {
        type: String,
        trim: true
        },
        publicId: {
       type: String,
        trim: true
        }
    },
    privacyPolicy: {
         secureUrl: {
        type: String,
        trim: true
        },
        publicId: {
       type: String,
        trim: true
        }
    },
    role: {
        type: String,
        default: 'Tourist'
    }
}, { timestamps: true })

const touristModel = mongoose.model('tourist', touristSchema)
module.exports = touristModel