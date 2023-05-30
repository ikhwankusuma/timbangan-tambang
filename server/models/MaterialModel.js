const { Schema, model } = require('mongoose')

const MaterialSchema = Schema({
  name: {
    type: String,
    required: true,
  }
})

module.exports = model('Materials', MaterialSchema)