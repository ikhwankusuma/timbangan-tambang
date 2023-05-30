const express = require('express')

const { errorHandler } = require('../plugins/helpers')

const Customer = require('../models/CustomerModel')
const Scale = require('../models/ScaleModel')

const router = express.Router()

router.get('/', async (req, res) => {
  const {
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    const customers = await Customer.find({}).exec()
    return res.status(200).send({ message: 'SUCCESS', customers })
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
    if (await Customer.findOne({ name }).exec()) throw new Error('CUSTOMER_ALREADY_EXIST')
    const newCustomer = new Customer({
      name,
      phone,
      address,
      email
    })
    await newCustomer.save()
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
    const customer = await Customer.findOne({ _id }).exec()
    if (name && !(await Customer.findOne({ name }).exec())) {
      await Scale.updateMany({ customer: customer.name }, { $set: { customer: name.toLowerCase() } }).exec()
      customer.name = name
    }
    if (phone) customer.phone = phone
    if (address) customer.address = address
    if (email) customer.email = email
    await Customer.updateOne({ _id }, { $set: customer }).exec()
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

module.exports = router