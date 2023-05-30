const { Schema, model } = require('mongoose')

const CustomerSchema = Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String
  },
  address: {
    type: String
  },
  email: {
    type: String
  }
})

module.exports = model('Customers', CustomerSchema)