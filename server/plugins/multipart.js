const multer = require('multer')
const path = require('path')
const { access, mkdir } = require('fs/promises')
const { constants } = require('fs')
const { promisify } = require('util')

const storage = multer.diskStorage({
  async destination(req, file, cb) {
    const dir = path.join(`${__dirname}/../files/${req.params._id}`)
    try {
      await access(dir, constants.F_OK)
      cb(null, dir)
    } catch (e) {
      await mkdir(dir, { recursive: true })
      cb(null, dir)
    }
  },
  async filename(req, file, cb) {
    let filename = `${file.originalname}`
    const dir = path.join(`${__dirname}/../files/${req.params._id}/${filename}`)
    try {
      await access(dir, constants.F_OK)
      filename += '-copy'
      cb(null, filename)
    } catch (e) {
      cb(null, filename)
    }
  }
})

const multipartHandler = promisify(multer({ storage }).array('files'))

module.exports = { multipartHandler }