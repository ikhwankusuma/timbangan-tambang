const { Schema, model } = require('mongoose')

const SupplierSchema = Schema({
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

module.exports = model('Suppliers', SupplierSchema)