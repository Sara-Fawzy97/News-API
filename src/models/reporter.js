const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const validator = require('validator')
const jwt = require('jsonwebtoken')
    //name,email,age,phone,password,avatar
const reporterSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {

                throw new Error("Email is invalid")
            }
        }
    },
    age: {
        type: Number,
        default: 40,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be positive')
            }
        }
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        length: 11,
        validate(value) {
            if (!validator.isMobilePhone(value, 'ar-EG')) {
                throw new Error("Invalid number")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minLength: 6
    },
    tokens: [{
        type: String,
        required: true
    }],
    avatar: {
        type: Buffer,

    }
})

reporterSchema.virtual('new', {
        ref: "New",
        localField: '_id',
        foreignField: 'owner'
    })
    //check email and password to login
reporterSchema.statics.findByCredentials = async(email, password) => {

        const reporter = await Reporter.findOne({ email })
        if (!reporter) {
            throw new Error("check your email")
        }
        const isMatch = await bcrypt.compare(password, reporter.password)
        if (!isMatch) {
            throw new Error('check your password')
        }
        return reporter

    }
    //to hash passwords
reporterSchema.pre("save", async function(next) {
    const user = this
    if (user.isModified('password'))
        user.password = await bcrypt.hash(user.password, 8)
    next()
})

//to generate new token
reporterSchema.methods.generateToken = async function() {
    const reporter = this
    const token = jwt.sign({ _id: reporter.id.toString() }, process.env.JWT_SECRET)
    reporter.tokens = reporter.tokens.concat(token)
    await reporter.save()

    return token

}

reporterSchema.methods.toJSON = function() {
    const reporter = this
    const reportObject = reporter.toObject()

    delete reportObject.password
    delete reportObject.tokens
    return reportObject
}
const Reporter = mongoose.model('Reporter', reporterSchema)

module.exports = Reporter