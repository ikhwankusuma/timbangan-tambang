const express = require('express')
const bcrypt = require('bcrypt')

const { promisify } = require('util')
const { generateToken, verifyToken } = require('../plugins/tokens')
const { errorHandler } = require('../plugins/helpers')

const hash = promisify(bcrypt.hash)
const compare = promisify(bcrypt.compare)
const genSalt = promisify(bcrypt.genSalt)

const User = require('../models/UserModel')

const availableRoles = [
  'admin',
  'operator'
]

const router = express.Router()

router.get('/users-count', async (req, res) => {
  try {
    const count = await User.find({}).countDocuments().exec()
    return res.status(200).send({ message: 'SUCCESS', count })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.put('/edit-user/:_id', async (req, res) => {
  const {
    body: userData,
    params: { _id },
    user
  } = req
  try {
    if (!user) throw new Error('UNAUTHORIZED')
    const issuer = await User.findOne({ _id }).exec()
    if (userData.password !== issuer.password && userData.password !== null && userData.password !== '') {
      const salt = await genSalt(10)
      issuer.password = await hash(userData.password, salt)
    }
    if (issuer.name) issuer.name = userData.name
    if (issuer.role || !availableRoles.includes(issuer.role)) issuer.role = userData.role
    await User.updateOne({ _id }, { $set: issuer }).exec()
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.put('/edit-role', async (req, res) => {
  const {
    body: { username, role },
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    const target = await User.findOne({ username }).exec()
    if (!target) throw new Error('USER_NOT_FOUND')
    if (!availableRoles.includes(role)) throw new Error('INVALID_REQUEST')
    target.role = role
    await User.updateOne({ username }, { $set: target }).exec()
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.post('/register', async (req, res) => {
  const {
    body: { name, username, password, role },
    user
  } = req
  try {
    const count = await User.find({}).countDocuments().exec()
    if (!count) {
      if (
        typeof username !== 'string' || !username.length ||
        typeof name !== 'string' || !name.length ||
        typeof password !== 'string' || !password.length
      ) throw new Error('INVALID_REQUEST2')
      const salt = await genSalt(10)
      const NewUser = new User({
        name,
        username,
        role: 'owner',
        password: await hash(password, salt),
        create_date: new Date()
      })
      await NewUser.save()
      return res.status(200).send({ message: 'SUCCESS' })
    } else {
      if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
      if (
        typeof name !== 'string' || !name.length ||
        typeof username !== 'string' || !username.length ||
        typeof password !== 'string' || !password.length ||
        typeof role !== 'string' || !availableRoles.includes(role)
      ) throw new Error('INVALID_REQUEST1')
      if (await User.findOne({ username }).exec()) throw new Error('USER_ALREADY_EXIST')
      const salt = await genSalt(10)
      const NewUser = new User({
        name,
        username,
        role,
        password: await hash(password, salt),
        create_date: new Date()
      })
      await NewUser.save()
      return res.status(200).send({ message: 'SUCCESS' })
    }
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.post('/refresh-token', async (req, res) => {
  const {
    body: { token }
  } = req
  try {
    if (!token) throw new Error('INVALID_REQUEST')
    const obj = verifyToken(token)
    if (!obj) throw new Error('INVALID_TOKEN')
    const { sub, role, username, name } = obj
    if (!sub || !role || !username || !name) throw new Error('UNAUTHORIZED')
    const user = await User.findOne({ _id: sub }).exec()
    const newToken = generateToken(sub, { role: user.role, username: user.username, name: user.name })
    return res.status(200).send({ message: 'SUCCESS', token: newToken, role: user.role, username: user.username, name: user.name })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.post('/login', async (req, res) => {
  const {
    body: { username, password }
  } = req
  try {
    if (!username || !password) throw new Error('INVALID_REQUEST')
    const user = await User.findOne({ username }).exec()
    if (!user) throw new Error('INVALID_COMBINATION')
    if (!await compare(password, user.password)) throw new Error('INVALID_COMBINATION')
    const token = generateToken(user._id.toString(), { role: user.role, username, name: user.name })
    return res.status(200).send({ message: 'SUCCESS', token, username, role: user.role, name: user.name })
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
    const userToDelete = await User.findOne({ _id }).exec()
    if (userToDelete.role === 'owner') throw new Error('OWNER_CAN_NOT_BE_DELETED')
    await User.deleteOne({ _id }).exec()
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.get('/', async (req, res) => {
  const {
    query: { id: _id },
    user
  } = req
  try {
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    const users = await User.aggregate([
      {
        $project: {
          name: '$name',
          username: '$username',
          create_date: '$create_date',
          role: '$role',
          selectedOption: '$role',
          options: ['admin', 'operator']
        }
      }
    ]).exec()
    return res.status(200).send({ message: 'SUCCESS', users })
  } catch (e) {
    return errorHandler(e, res)
  }
})

module.exports = router