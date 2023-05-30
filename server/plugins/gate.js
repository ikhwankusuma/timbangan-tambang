const SerialPort = require('serialport')

async function isPortCorrect(port) {
  return new Promise((resolve, reject) => {
    if (port.isOpen) port.close()
    port.open((e) => {
      if (e) reject(e)
      const timeout = setTimeout(() => {
        if (port.isOpen) port.close()
        reject('TIMEOUT')
      }, 3000)
      let str = ''
      port.on('data', (data) => {
        try {
          str += data.toString().trim()
          if (str.includes('yes')) {
            clearTimeout(timeout)
            if (port.isOpen) port.close()
            setTimeout(() => {
              resolve(port)
            }, 100)
          }
        } catch (e) {
          if (port.isOpen) port.close()
          clearTimeout(timeout)
          reject(e)
        }
      })
    })
  })
}

async function detectPort() {
  return new Promise(async (resolve, reject) => {
    const portList = await SerialPort.list()
    for (let i = 0; i < portList.length; i++) {
      const { path } = portList[i]
      try {
        const port = new SerialPort(path, {
          autoOpen: false,
          baudRate: 9600,
          dataBits: 8,
          parity: 'none',
          stopBits: 1,
        })
        await isPortCorrect(port)
        if (port.isOpen) port.close()
        return resolve(path)
      } catch (e) {
        console.log(`${path} FAILED: ${e}`)
      }
      if (i === portList.length - 1) return reject('PORT NOT FOUND')
    }
  })
}

module.exports = { detectPort }