const mongoose = require('mongoose')
    //title, dexcription,owner,avatar,date
const newsSchema = mongoose.Schema({
        title: {
            type: String,
            required: true
        },
        description: {
            type: String,
            required: true
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Reporter'
        },
        avatar: {
            type: Buffer
        }
    }
    // updated: {
    //     type: Date,
    //     default: Date.now
    // }
    , {
        timestamps: {
            createdAt: 'Created_at',
            updatedAt: 'Updated_at'
                // currentTime: () => Math.floor(Date.now() / 1000)
        }
    })

const New = mongoose.model('New', newsSchema)
module.exports = New