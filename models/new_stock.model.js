const mongoose = require('mongoose')
const Schema = mongoose.Schema

const stockSchema = new Schema (
    {
        stock: String,
        likes: Number,
        rel_likes: Number
    }
)

const Stock = mongoose.model('Stock', stockSchema)

module.exports = Stock