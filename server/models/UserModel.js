const { Schema, model } = require('mongoose')

const UserSchema = Schema({
  username: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'operator',
  },
  create_date: {
    type: Date,
    default: new Date(),
  },
})

module.exports = model('Users', UserSchema)
