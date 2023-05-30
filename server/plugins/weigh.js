const SerialPort = require('serialport')

async function isPortCorrect(port) {
  return new Promise((resolve, reject) => {
    port.open((e) => {
      const regex = /((\+|\-)\d+\.\d*)|(\+|\-) *\d+/g
      let str = ''
      const timeout = setTimeout(() => {
        reject()
      }, 1000)
      port.on('data', async (data) => {
        try {
          str += data.toString()
          if (regex.test(str)) {
            clearTimeout(timeout)
            if (port.isOpen) await port.close()
            setTimeout(() => {
              resolve(port)
            }, 100)
          }
        } catch (e) {
          reject(e)
        }
      })
    })
  })
}

async function detectPorts() {
  return new Promise(async (resolve) => {
    const paths = []
    const portsList = await SerialPort.list()
    if (!portsList.length) resolve([])
    for (let i = 0; i < portsList.length; i++) {
      try {
        const { path, serialNumber } = portsList[i]
        const port = new SerialPort(path, {
          autoOpen: false,
          baudRate: 2400,
          dataBits: 7,
          parity: 'none',
          stopBits: 1,
          lock: false
        })
        await isPortCorrect(port)
        paths.push({
          path,
          string: '',
          id: serialNumber
        })
      } catch { }
      if (i === portsList.length - 1) resolve(paths)
    }
  })
}

module.exports = { detectPorts }