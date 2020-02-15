const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ipSchema = new Schema (
    {
        ip: String
    }
)

const IP = mongoose.model('IP', ipSchema)

module.exports = IP