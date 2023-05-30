const { access, mkdir } = require('fs/promises')
const { constants, readFileSync } = require('fs')
const jwt = require('jsonwebtoken')

const public = readFileSync('./keys/public.pem', 'utf-8')

function verifyAuthority() {
  try {
    const rawConfig = readFileSync('./config.json', 'utf-8')
    const { token } = JSON.parse(rawConfig)
    const { status, expiration } = jwt.verify(token, public, {
      algorithms: ['RS256'],
      issuer: 'SwiftDesign',
      audience: process.env.BASE_URL || 'http://localhost:8000'
    })
    if (status === 'activated' || (status === 'trial' && new Date(expiration).getTime() > new Date().getTime())) return true
    else return false
  } catch (e) {
    return false
  }
}

function errorHandler(e, res) {
  const { message } = e
  let code = 500
  switch (message) {
    case 'INVALID_REQUEST':
      code = 400
      break
    case 'INVALID_COMBINATION':
      code = 400
      break
    case 'INVALID_PASSWORD':
      code = 400
      break
    case 'ALREADY_LOGGED_IN':
      code = 400
      break
    case 'USER_ALREADY_EXIST':
      code = 400
      break
    case 'CUSTOMER_ALREADY_EXIST':
      code = 400
      break
    case 'SUPPLIER_ALREADY_EXIST':
      code = 400
      break
    case 'OWNER_CAN_NOT_BE_DELETED':
      code = 400
      break
    case 'UNAUTHORIZED':
      code = 401
      break
    default:
      code = 500
      break
  }
  return res.status(code).send({ message })
}

async function createFolder(dir) {
  try {
    await access(dir, constants.F_OK)
    return null
  } catch (e) {
    await mkdir(dir, { recursive: true })
    return null
  }
}

module.exports = {
  errorHandler,
  verifyAuthority,
  createFolder
}