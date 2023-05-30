const { Schema, model } = require('mongoose')

const ScaleSchema = Schema({
  record: {
    type: String,
    required: true,
  },
  entry_date: {
    type: Date,
    required: true,
  },
  operator: {
    type: String,
    required: true
  },
  exit_date: {
    type: Date
  },
  entry_weight: {
    type: Object
  },
  entry_photos: {
    type: [String],
  },
  exit_weight: {
    type: Object
  },
  exit_photos: {
    type: [String],
  },
  weight: {
    type: Object
  },
  photos: {
    type: [String],
  },
  location: {
    type: String,
    required: true,
  },
  license: {
    type: String
  },
  material: {
    type: String
  },
  customer: {
    type: String
  },
  supplier: {
    type: String
  },
  notes: {
    type: String
  },
  type: {
    type: Number
  },
  status: {
    type: String
  },
  deleted: {
    type: Boolean
  },
  uploaded: {
    type: Boolean,
    default: false
  }
})

module.exports = model('Scales', ScaleSchema)