const express = require('express')
const fs = require('fs')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { promisify } = require('util')
const { errorHandler } = require('../plugins/helpers')

const Scale = require('../models/ScaleModel')
const Material = require('../models/MaterialModel')
const Customer = require('../models/CustomerModel')
const Supplier = require('../models/SupplierModel')
const User = require('../models/UserModel')

const hash = promisify(bcrypt.hash)
const compare = promisify(bcrypt.compare)
const genSalt = promisify(bcrypt.genSalt)

const availableStatuses = ['activated', 'trial']

const router = express.Router()

function genRandomStr(length) {
  const availableChars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ012345689'
  let str = ''
  for (let i = 0; i < length; i++) {
    str += availableChars[Math.round(Math.random() * (availableChars.length - 1))]
  }
  return str
}

const private = fs.readFileSync('./keys/private.key', 'utf-8')
const public = fs.readFileSync('./keys/public.pem', 'utf-8')

router.get('/config', async (req, res) => {
  try {
    const rawConfig = fs.readFileSync('./config.json', 'utf-8')
    const { token } = JSON.parse(rawConfig)
    const config = jwt.verify(token, public, {
      algorithms: ['RS256'],
      issuer: 'SwiftDesign',
      audience: process.env.BASE_URL || 'http://localhost:8000'
    })
    return res.status(200).send({ message: 'SUCCESS', config })
  } catch (e) {
    if (e.message === "ENOENT: no such file or directory, open './config.json'")
      return res.status(200).send({ message: 'NO_CONFIG' })
    return errorHandler(e, res)
  }
})

router.post('/create-config', async (req, res) => {
  const {
    body: {
      url,
      password,
      name,
      type,
      status,
      plugins,
      location,
      exp
    }
  } = req
  try {
    if (!await compare(password, '$2b$10$z5ftYAJST5Po2Rpk2.9NDeA74g/R8cbX49U9jiFxX9P2AuRn3hDP.')) throw new Error('UNAUTHORIZED')
    if (
      !name || !availableStatuses.includes(status) ||
      (status === 'trial' && (!exp || typeof exp !== 'number'))
    )
      throw new Error('INVALID_REQUEST')
    const code = genRandomStr(20)
    const salt = await genSalt(10)
    const config = {
      name,
      type,
      status,
      location,
      url,
      plugins
    }
    if (status === 'trial') {
      config.expiration = new Date(exp)
      config.password = await hash(code, salt)
      fs.writeFileSync('../sn.txt', code)
    }
    await Scale.deleteMany({}).exec()
    await Customer.deleteMany({}).exec()
    await Material.deleteMany({}).exec()
    await Supplier.deleteMany({}).exec()
    await User.deleteMany({}).exec()
    await new User({
      name: 'Admin',
      username: 'admin',
      role: 'owner',
      password: await hash('admin', salt)
    }).save()
    const token = jwt.sign(config, private, {
      algorithm: 'RS256',
      issuer: 'SwiftDesign',
      audience: process.env.BASE_URL || 'http://localhost:8000'
    })
    fs.writeFileSync('./config.json', JSON.stringify({ token }))
    return res.status(200).send({ message: 'SUCCESS', code: status === 'trial' ? code : null })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.put('/edit-config', async (req, res) => {
  const {
    body: { phone, address, email },
    user
  } = req
  try {
    if (!user || user.role !== 'owner') throw new Error('UNAUTHORIZED')
    const rawConfig = fs.readFileSync('./config.json', 'utf-8')
    const { token } = JSON.parse(rawConfig)
    const config = jwt.verify(token, public, {
      algorithms: ['RS256'],
      issuer: 'SwiftDesign',
      audience: process.env.BASE_URL || 'http://localhost:8000'
    })
    if (phone) config.phone = phone
    if (address) config.address = address
    if (email) config.email = email
    const newToken = jwt.sign(config, private, {
      algorithm: 'RS256',
    })
    fs.writeFileSync('./config.json', JSON.stringify({ token: newToken }))
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.post('/activate', async (req, res) => {
  const {
    body: { code },
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    const rawConfig = fs.readFileSync('./config.json', 'utf-8')
    const { token } = JSON.parse(rawConfig)
    const config = jwt.verify(token, public, {
      algorithms: ['RS256'],
      issuer: 'SwiftDesign',
      audience: process.env.BASE_URL || 'http://localhost:8000'
    })
    if (!await compare(code, config.password)) throw new Error('INVALID_CODE')
    config.status = 'activated'
    delete config.exp
    delete config.password
    const newToken = jwt.sign(config, private, {
      algorithm: 'RS256',
    })
    fs.writeFileSync('./config.json', JSON.stringify({ token: newToken }))
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.get('/backup-data', async (req, res) => {
  const { user } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    const scales = await Scale.find({}).exec()
    const customers = await Customer.find({}).exec()
    const suppliers = await Supplier.find({}).exec()
    return res.status(200).send({
      message: 'SUCCESS',
      payload: {
        scales, customers, suppliers
      }
    })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.post('/restore-data', async (req, res) => {
  const {
    body: { payload },
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    await Scale.deleteMany({}).exec()
    await Customer.deleteMany({}).exec()
    await Supplier.deleteMany({}).exec()
    await Scale.insertMany(payload.scales, { ordered: false })
    await Customer.insertMany(payload.customers, { ordered: false })
    await Supplier.insertMany(payload.suppliers, { ordered: false })
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

module.exports = router