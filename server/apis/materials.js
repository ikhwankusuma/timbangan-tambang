const express = require('express')

const { errorHandler } = require('../plugins/helpers')

const Material = require('../models/MaterialModel')
const Scale = require('../models/ScaleModel')

const router = express.Router()

router.get('/', async (req, res) => {
  const {
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    const materials = await Material.find({}).exec()
    return res.status(200).send({ message: 'SUCCESS', materials })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.post('/', async (req, res) => {
  const {
    body: {
      name
    },
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    if (await Material.findOne({ name }).exec()) throw new Error('MATERIAL_ALREADY_EXIST')
    const newMaterial = new Material({
      name
    })
    await newMaterial.save()
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.put('/:_id', async (req, res) => {
  const {
    params: { _id },
    body: {
      name
    },
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    const material = await Material.findOne({ _id }).exec()
    if (name && !(await Material.findOne({ name }).exec())) {
      await Scale.updateMany({ material: material.name }, { $set: { material: name.toLowerCase() } }).exec()
      material.name = name
    }
    await Material.updateOne({ _id }, { $set: material }).exec()
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
    await Material.deleteOne({ _id }).exec()
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

module.exports = router