const fs = require('fs')
const jwt = require('jsonwebtoken')

const private = fs.readFileSync('./keys/private.key', 'utf-8')
const public = fs.readFileSync('./keys/public.pem', 'utf-8')

function generateToken(subject, payload) {
  try {
    if (subject && payload)
      return jwt.sign(payload, private, {
        algorithm: 'RS256',
        expiresIn: '24h',
        issuer: 'SwiftDesign',
        audience: process.env.BASE_URL || 'http://localhost:8000',
        subject
      })
    else
      return null
  } catch (e) {
    return null
  }
}

function verifyToken(token) {
  try {
    if (token)
      return jwt.verify(token, public, {
        algorithms: ['RS256'],
        issuer: 'SwiftDesign',
        audience: process.env.BASE_URL || 'http://localhost:8000'
      })
    else
      return null
  } catch (e) {
    return null
  }
}

module.exports = {
  generateToken,
  verifyToken
}