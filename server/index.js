require('dotenv').config()

const http = require('http')

const jwt = require('jsonwebtoken')
const fs = require('fs')
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const socketIO = require('socket.io')
const cors = require('cors')
const SerialPort = require('serialport')
const rtspRelay = require('rtsp-relay')


const { verifyToken } = require('./plugins/tokens')
const { detectPorts } = require('./plugins/weigh')
const { detectPort } = require('./plugins/gate')

const users = require('./apis/users')
const scales = require('./apis/scales')
const admin = require('./apis/admin')
const customers = require('./apis/customers')
const suppliers = require('./apis/suppliers')
const materials = require('./apis/materials')

const app = express()

mongoose.connect(process.env.MONGO_DATABASE || 'mongodb://localhost:27017/scale-master', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
}).connection

app
  .use(express.static('public'))
  .use('/files', express.static('files'))
  .use(cors({
    origin: ['http://localhost:4000']
  }))
  .use(cookieParser())
  .use(express.json({ limit: '50mb' }))
  .use(express.urlencoded({ limit: '50mb', extended: false }))
  .use((req, res, next) => {
    try {
      const bearerHeader = req.headers['authorization']
      if (typeof bearerHeader === 'string') {
        const token = bearerHeader.split(' ')[1]
        const { sub, role, username } = verifyToken(token)
        if (!sub || !role || !username) throw new Error('UNAUTHORIZED')
        req.user = {
          _id: sub,
          role,
          username
        }
        req.token = token
        next()
      } else {
        req.user = null
        next()
      }
    } catch (e) {
      req.user = null
      next()
    }
  })

const server = http.createServer(app)

const { proxy } = rtspRelay(app, server)

app.ws('/stream/:cameraIP', (ws, req) => {
  try {
    const { username, password } = req.query
    proxy({
      url: `rtsp://${username}:${password}@${req.params.cameraIP}:554/Streaming/Channels/1`,
    })(ws)
  } catch (e) { }
})

const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:4000'
  }
})

const weighNSP = io.of('/weigh')

let path = ''
let port = null
let paths = []
let ports = []
let timeout = null

weighNSP.on('connection', (socket) => {
  socket.on('start-weighing', async () => {
    try {
      clearTimeout(timeout)
      let isOpen = false
      if (ports.length) {
        for (let i = 0; i < ports.length; i++) {
          const port = ports[i]
          if (port.isOpen) isOpen = true
        }
      } else {
        ports = []
        paths = await detectPorts()
        if (!paths.length) weighNSP.emit('weigh-error')
      }
      if (!isOpen)
        for (let i = 0; i < paths.length; i++) {
          let str = ''
          const port = new SerialPort(paths[i].path, {
            baudRate: 2400,
            dataBits: 7,
            parity: 'none',
            stopBits: 1,
            lock: false
          })
          ports.push(port)
          port.on('data', (data) => {
            str += data.toString()
            clearTimeout(timeout)
            timeout = setTimeout(() => {
              weighNSP.emit('weigh-error')
            }, 2500)
            if (/\r\n/.exec(str)) {
              let data = str.trim()
              str = ''
              if (data) {
                data = data.match(/((\+|\-) *(\d+\.\d+|\d+|\d+\.+\w+)([a-z|A-Z]+| *[a-z|A-Z]+))/g)
                if (data && data.length === 1) {
                  data = parseFloat(data[0].replace(' ', ''))
                  weighNSP.emit('weight-update', {
                    weight: data,
                    path: port.path
                  })
                }
              }
            }
          })
          port.on('close', () => {
            weighNSP.emit('weigh-disconnected')
          })
        }
    } catch (e) {
      weighNSP.emit('weigh-error')
    }
  })
  socket.on('refresh-weigh', async () => {
    try {
      clearTimeout(timeout)
      if (ports.length)
        for (let i = 0; i < ports.length; i++) {
          try {
            const port = ports[i]
            if (port.isOpen) await port.close()
          } catch (e) {
            ports = []
            paths = await detectPorts()
            if (!paths.length) weighNSP.emit('weigh-refresh-error')
            weighNSP.emit('weigh-refresh-done')
          }
          if (i === ports.length - 1) {
            ports = []
            paths = await detectPorts()
            if (!paths.length) weighNSP.emit('weigh-refresh-error')
            weighNSP.emit('weigh-refresh-done')
          }
        }
      else {
        paths = await detectPorts()
        if (!paths.length) weighNSP.emit('weigh-refresh-error')
        weighNSP.emit('weigh-refresh-done')
      }
    } catch (e) {
      weighNSP.emit('weigh-refresh-error')
    }
  })
  socket.on('disconnect', async () => {
    clearTimeout(timeout)
    for (let i = 0; i < ports.length; i++) {
      try {
        const port = ports[i]
        if (port.isOpen) await port.close()
      } catch (e) {
        ports = []
        paths = await detectPorts()
      }
      if (i === ports.length - 1) {
        ports = []
        paths = await detectPorts()
      }
    }
  })
  socket.on('open-barrier', async () => {
    try {
      if (!port || !port.isOpen) await assignPort()
      if (port && port.isOpen) {
        port.write('on', 'ascii')
      }
    } catch (e) {
      console.log(e)
      assignPort()
    }
  })
  socket.on('close-barrier', async () => {
    try {
      if (!port || !port.isOpen) await assignPort()
      if (port && port.isOpen) {
        port.write('off', 'ascii')
      }
    } catch (e) {
      console.log(e)
      assignPort()
    }
  })
})

app
  .use('/users', users)
  .use('/scales', scales)
  .use('/admin', admin)
  .use('/customers', customers)
  .use('/suppliers', suppliers)
  .use('/materials', materials)

app.set('weighNSP', weighNSP)

function getConfig() {
  try {
    const public = fs.readFileSync('./keys/public.pem', 'utf-8')
    const rawConfig = fs.readFileSync('./config.json', 'utf-8')
    const { token } = JSON.parse(rawConfig)
    const config = jwt.verify(token, public, {
      algorithms: ['RS256'],
      issuer: 'SwiftDesign',
      audience: process.env.BASE_URL || 'http://localhost:8000'
    })
    return config
  } catch (e) {
    console.log(e)
    return null
  }
}

async function assignPort() {
  try {
    const config = getConfig()
    if (config && config.plugins.includes(2)) {
      path = await detectPort()
      port = new SerialPort(path, {
        baudRate: 9600,
        dataBits: 8,
        parity: 'none',
        stopBits: 1,
        lock: false,
        endOnClose: true
      }, (e) => {
        if (!e) {
          console.log(`${path} CONNECTED`)
        }
        port.on('close', () => port = null)
        port.on('error', () => port = null)
      })
    }
  } catch (e) {
    console.log(e)
  }
}

async function start() {
  server.listen(7000)
  console.info('Server listening on http://localhost:7000')
  await assignPort()
}
start()
