const express = require('express')

const { errorHandler } = require('../plugins/helpers')

const Supplier = require('../models/SupplierModel')
const Scale = require('../models/ScaleModel')

const router = express.Router()

router.get('/', async (req, res) => {
  const {
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    const suppliers = await Supplier.find({}).exec()
    return res.status(200).send({ message: 'SUCCESS', suppliers })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.post('/', async (req, res) => {
  const {
    body: {
      name,
      phone,
      address,
      email
    },
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    if (await Supplier.findOne({ name }).exec()) throw new Error('SUPPLIER_ALREADY_EXIST')
    const newSupplier = new Supplier({
      name,
      phone,
      address,
      email
    })
    await newSupplier.save()
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.put('/:_id', async (req, res) => {
  const {
    params: { _id },
    body: {
      name,
      phone,
      address,
      email
    },
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    const supplier = await Supplier.findOne({ _id }).exec()
    if (name && !(await Supplier.findOne({ name }).exec())) {
      await Scale.updateMany({ supplier: supplier.name }, { $set: { supplier: name.toLowerCase() } }).exec()
      supplier.name = name
    }
    if (phone) supplier.phone = phone
    if (address) supplier.address = address
    if (email) supplier.email = email
    await Supplier.updateOne({ _id }, { $set: supplier }).exec()
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.delete('/:_id', async (req, res) => {
  const {
    params: { _id },
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    await Supplier.deleteOne({ _id }).exec()
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

module.exports = router