const jwt = require('jsonwebtoken')
const AxiosDigestAuth = require('@mhoc/axios-digest-auth').default
const FormData = require('form-data')
const express = require('express')
const officegen = require('officegen')
const axios = require('axios')
const fs = require('fs/promises')
const path = require('path')
const XLSX = require('xlsx');
const excel = require('node-excel-export');

const { readFileSync, createReadStream } = require('fs')
const { errorHandler, verifyAuthority, createFolder } = require('../plugins/helpers')

const Scale = require('../models/ScaleModel')
const Customer = require('../models/CustomerModel')
const Supplier = require('../models/SupplierModel')
const Material = require('../models/MaterialModel')

const router = express.Router()

function getConfig() {
  try {
    const public = readFileSync('./keys/public.pem', 'utf-8')
    const rawConfig = readFileSync('./config.json', 'utf-8')
    const { token } = JSON.parse(rawConfig)
    const config = jwt.verify(token, public, {
      algorithms: ['RS256'],
      issuer: 'SwiftDesign',
      audience: process.env.BASE_URL || 'http://localhost:8000'
    })
    return config
  } catch (e) {
    return null
  }
}

function formatDate(x) {
  const dateObj = new Date(x)
  const date = dateObj.getDate()
  const month = dateObj.getMonth() + 1
  const year = dateObj.getFullYear()
  return `${date.toString().padStart(2, 0)}-${month.toString().padStart(2, 0)}-${year}`
}
function formatTime(x) {
  const dateObj = new Date(x)
  const hours = dateObj.getHours()
  const minutes = dateObj.getMinutes()
  return `${hours.toString().padStart(2, 0)}:${minutes.toString().padStart(2, 0)}`
}

function formatRecord(x) {
  x++
  if (x >= 10000) return `${new Date().getFullYear() - 2000}${x}`
  else if (x >= 1000) return `${new Date().getFullYear() - 2000}0${x}`
  else if (x >= 100) return `${new Date().getFullYear() - 2000}00${x}`
  else if (x >= 10) return `${new Date().getFullYear() - 2000}000${x}`
  else return `${new Date().getFullYear() - 2000}0000${x}`
}

router.get('/export-test', async (req, res) => {
  try {


    const styles = {
      headerBold: {
        font: {
          color: {
            rgb: 'FFFFFFFF'
          },
          bold: true,
        },

      },
      cellPink: {
        fill: {
          fgColor: {
            rgb: 'FFFFCCFF'
          }
        }
      },
      cellGreen: {
        fill: {
          fgColor: {
            rgb: 'FF00FF00'
          }
        }
      }
    };

    //Array of objects representing heading rows (very top)
    const heading = [
      [{ value: 'a1', style: styles.headerBold }, { value: 'b1', style: styles.headerBold }, { value: 'c1', style: styles.headerDark }],
    ];

    //Here you specify the export structure
    const specification = {
      customer_name: { // <- the key should match the actual data key
        displayName: 'Customer', // <- Here you specify the column header
        headerStyle: styles.headerDark, // <- Header style
        cellStyle: function (value, row) { // <- style renderer function
          // if the status is 1 then color in green else color in red
          // Notice how we use another cell value to style the current one
          return (row.status_id == 1) ? styles.cellGreen : { fill: { fgColor: { rgb: 'FFFF0000' } } }; // <- Inline cell style is possible 
        },
        width: 120 // <- width in pixels
      },
      status_id: {
        displayName: 'Status',
        headerStyle: styles.headerDark,
        cellFormat: function (value, row) { // <- Renderer function, you can access also any row.property
          return (value == 1) ? 'Active' : 'Inactive';
        },
        width: '10' // <- width in chars (when the number is passed as string)
      },
      note: {
        displayName: 'Description',
        headerStyle: styles.headerDark,
        cellStyle: styles.cellPink, // <- Cell style
        width: 220 // <- width in pixels
      }
    }

    // The data set should have the following shape (Array of Objects)
    // The order of the keys is irrelevant, it is also irrelevant if the
    // dataset contains more fields as the report is build based on the
    // specification provided above. But you should have all the fields
    // that are listed in the report specification
    const dataset = [
      { customer_name: 'IBM', status_id: 1, note: 'some note', misc: 'not shown' },
      { customer_name: 'HP', status_id: 0, note: 'some note' },
      { customer_name: 'MS', status_id: 0, note: 'some note', misc: 'not shown' }
    ]

    // Define an array of merges. 1-1 = A:1
    // The merges are independent of the data.
    // // A merge will overwrite all data _not_ in the top-left cell.
    // const merges = [
    //   // { start: { row: 1, column: 1 }, end: { row: 1, column: 10 } },
    //   // { start: { row: 2, column: 1 }, end: { row: 2, column: 5 } },
    //   // { start: { row: 2, column: 6 }, end: { row: 2, column: 10 } }
    // ]

    // Create the excel report.
    // This function will return Buffer
    const report = excel.buildExport(
      [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
        {
          name: 'Report', // <- Specify sheet name (optional)
          heading: heading, // <- Raw heading array (optional)
          // merges: merges, // <- Merge cell ranges
          specification: specification, // <- Report specification
          data: dataset // <-- Report data
        }
      ]
    );

    res.setHeader('Content-disposition', 'attachment; filename=Report.xlsx');
    res.send(report);
    return res.status(200)
  } catch (e) {
    errorHandler(e, res)
    console.log(e)
  }

})

router.get('/summary', async (req, res) => {
  try {
    const {
      query: {
        license,
        material,
        customer,
        supplier,
        status,
        start_date,
        end_date,
        type,
      }
    } = req
    let ids = []
    if (req.query && Object.keys(req.query).length) {
      const scalePipeline = [
        {
          $match: {
            $expr: {
              $and: [
                { $ne: ['$deleted', true] },
                { $or: [] }
              ]
            }
          }
        },
      ]
      if (license) {
        const regex = `${license}`
        scalePipeline[0].$match.$expr.$and[1].$or.push({
          $regexMatch: {
            input: '$license',
            options: 'i',
            regex
          }
        })
      }
      if (material) {
        const regex = `${material}`
        scalePipeline[0].$match.$expr.$and[1].$or.push({
          $regexMatch: {
            input: '$material',
            options: 'i',
            regex
          }
        })
      }
      if (supplier) {
        const regex = `${supplier}`
        scalePipeline[0].$match.$expr.$and[1].$or.push({
          $regexMatch: {
            input: '$supplier',
            options: 'i',
            regex
          }
        })
      }
      if (customer) {
        const regex = `(${customer})`
        scalePipeline[0].$match.$expr.$and[1].$or.push({
          $regexMatch: {
            input: '$customer',
            options: 'i',
            regex
          }
        })
      }
      if (type) scalePipeline[0].$match.$expr.$and.push({ $eq: ['$type', parseInt(type)] })
      if (status) scalePipeline[0].$match.$expr.$and.push({ $eq: ['$status', status] })
      if (start_date) scalePipeline[0].$match.$expr.$and.push({ $gte: ['$entry_date', { $toDate: new Date(parseInt(start_date)).setHours(00, 00, 00, 1) }] })
      if (end_date) scalePipeline[0].$match.$expr.$and.push({ $lte: ['$entry_date', { $toDate: new Date(parseInt(end_date)).setHours(23, 59, 59, 999) }] })
      scalePipeline.push({
        $sort: {
          record: -1
        }
      }, {
        $project: {
          _id: '$_id'
        }
      })

      if (!scalePipeline[0].$match.$expr.$and[1].$or.length)
        scalePipeline[0].$match.$expr.$and.splice(1, 1)

      const scales = await Scale.aggregate(scalePipeline).exec()
      if (scales.length)
        ids = scales.map((a) => a._id.toString())
    }

    const currentDate = new Date()
    const startTime = new Date(currentDate.getFullYear(), currentDate.getMonth() - 6, 1, 0, 0, 0).getTime()
    const payload = {}
    const sumPipeline = [
      {
        $match: {
          $expr: {
            $and: [
              {
                $or: [
                  { $gte: ['$exit_date', { $toDate: startTime }] },
                  { $gte: ['$date', { $toDate: startTime }] }
                ]
              }
            ]
          }
        }
      },
      {
        $group: {
          _id: {
            $month: '$exit_date'
          },
          count: {
            $sum: {
              $cond: [
                '$weight',
                '$weight',
                {
                  $abs: {
                    $subtract: ['$entry_weight', '$exit_weight']
                  }
                }
              ]
            }
          }
        }
      },
      {
        $sort: {
          _id: -1
        }
      }
    ]
    const customerBreakdownPipeline = [
      {
        $match: {
          customer: { $ne: null },
          $expr: {
            $ne: ['$customer', '']
          }
        }
      },
      {
        $group: {
          _id: '$customer',
          count: {
            $sum: {
              $cond: [
                '$weight',
                '$weight',
                {
                  $abs: {
                    $subtract: ['$entry_weight', '$exit_weight']
                  }
                }
              ]
            }
          }
        }
      }
    ]
    const supplierBreakdownPipeline = [
      {
        $match: {
          supplier: { $ne: null },
          $expr: {
            $ne: ['$supplier', '']
          }
        }
      },
      {
        $group: {
          _id: '$supplier',
          count: {
            $sum: {
              $cond: [
                '$weight',
                '$weight',
                {
                  $abs: {
                    $subtract: ['$entry_weight', '$exit_weight']
                  }
                }
              ]
            }
          }
        }
      }
    ]
    const materialBreakdownPipeline = [
      {
        $match: {
          material: { $ne: null },
          $expr: {
            $ne: ['$material', '']
          }
        }
      },
      {
        $group: {
          _id: '$material',
          count: {
            $sum: {
              $cond: [
                '$weight',
                '$weight',
                {
                  $abs: {
                    $subtract: ['$entry_weight', '$exit_weight']
                  }
                }
              ]
            }
          }
        }
      }
    ]
    if (ids.length) {
      sumPipeline[0].$match.$expr = {
        $in: [{ $toString: '$_id' }, ids]
      }
      customerBreakdownPipeline[0].$match.$expr = {
        $and: [
          { $ne: ['$customer', ''] },
          { $in: [{ $toString: '$_id' }, ids] }
        ]
      }
      supplierBreakdownPipeline[0].$match.$expr = {
        $and: [
          { $ne: ['$supplier', ''] },
          { $in: [{ $toString: '$_id' }, ids] }
        ]
      }
      materialBreakdownPipeline[0].$match.$expr = {
        $and: [
          { $ne: ['$supplier', ''] },
          { $in: [{ $toString: '$_id' }, ids] }
        ]
      }
      payload.filtered = true
    }

    const sumWeight = await Scale.aggregate(sumPipeline).exec()
    const customerBreakdown = await Scale.aggregate(customerBreakdownPipeline).exec()
    const supplierBreakdown = await Scale.aggregate(supplierBreakdownPipeline).exec()
    const materialBreakdown = await Scale.aggregate(materialBreakdownPipeline).exec()
    payload.weights = sumWeight
    payload.customers = customerBreakdown
    payload.suppliers = supplierBreakdown
    payload.materials = materialBreakdown
    return res.status(200).send(payload)
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.get('/', async (req, res) => {
  const {
    query: {
      license,
      material,
      customer,
      supplier,
      status,
      start_date,
      end_date,
      limit,
      skip,
      type,
      export_excel
    }
  } = req
  try {
    let exports = []

    const payload = {}

    const materialPipeline = [
      {
        $group: {
          _id: '$name'
        }
      }
    ]
    const materials = await Material.aggregate(materialPipeline).exec()
    payload.materials = materials

    const customerPipeline = [
      {
        $group: {
          _id: '$name'
        }
      }
    ]
    const customers = await Customer.aggregate(customerPipeline).exec()
    payload.customers = customers

    const supplierPipeline = [
      {
        $group: {
          _id: '$name'
        }
      }
    ]
    const suppliers = await Supplier.aggregate(supplierPipeline).exec()
    payload.suppliers = suppliers

    const scalePipeline = [
      {
        $match: {
          $expr: {
            $and: [
              { $ne: ['$deleted', true] },
              { $or: [] }
            ]
          }
        }
      },
    ]

    if (license) {
      const regex = `${license}`
      scalePipeline[0].$match.$expr.$and[1].$or.push({
        $regexMatch: {
          input: '$license',
          options: 'i',
          regex
        }
      })
    }
    if (material) {
      const regex = `${material}`
      scalePipeline[0].$match.$expr.$and[1].$or.push({
        $regexMatch: {
          input: '$material',
          options: 'i',
          regex
        }
      })
    }
    if (supplier) {
      const regex = `${supplier}`
      scalePipeline[0].$match.$expr.$and[1].$or.push({
        $regexMatch: {
          input: '$supplier',
          options: 'i',
          regex
        }
      })
    }
    if (customer) {
      const regex = `(${customer})`
      scalePipeline[0].$match.$expr.$and[1].$or.push({
        $regexMatch: {
          input: '$customer',
          options: 'i',
          regex
        }
      })
    }
    if (type) scalePipeline[0].$match.$expr.$and.push({ $eq: ['$type', parseInt(type)] })
    if (status) scalePipeline[0].$match.$expr.$and.push({ $eq: ['$status', status] })
    if (start_date) scalePipeline[0].$match.$expr.$and.push({ $gte: ['$entry_date', { $toDate: new Date(parseInt(start_date)).setHours(00, 00, 00, 1) }] })
    if (end_date) scalePipeline[0].$match.$expr.$and.push({ $lt: ['$entry_date', { $toDate: new Date(parseInt(end_date)).setHours(23, 59, 59, 999) }] })

    scalePipeline.push({
      $sort: {
        record: -1
      }
    })

    if (skip) {
      scalePipeline.push({
        $skip: parseInt(skip)
      })
    }
    if (limit) {
      scalePipeline.push({
        $limit: parseInt(limit)
      })
    }

    if (!scalePipeline[0].$match.$expr.$and[1].$or.length)
      scalePipeline[0].$match.$expr.$and.splice(1, 1)

    const scales = await Scale.aggregate(scalePipeline).exec()
    payload.scales = scales

    const config = getConfig()

    if (export_excel && scales.length) {
      {
        const styles = {
          headerBold: {
            font: {
              bold: true,
            },
            alignment: {
              horizontal: "center",
              vertical: "center"
            },
            border: {
              top: { style: 'thin', auto: 1 },
              bottom: { style: 'thin', auto: 1 },
              left: { style: 'thin', auto: 1 },
              right: { style: 'thin', auto: 1 }
            }
          },
          borderStyle: {
            border: {
              top: { style: 'thin', auto: 1 },
              bottom: { style: 'thin', auto: 1 },
              left: { style: 'thin', auto: 1 },
              right: { style: 'thin', auto: 1 }
            }
          },
        }
        if (config.type === 1) {
          const specification = config && config.plugins.includes(3) ? {
            number: {
              displayName: 'No',
              headerStyle: styles.headerBold,
              cellStyle: function (value, row) {
                return (typeof row.number === 'string') ? styles.headerBold : styles.borderStyle; // <- Inline cell style is possible 
              },
              width: 25 // <- width in pixels
            },
            license: {
              displayName: 'No Polisi',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 90 // <- width in chars (when the number is passed as string)
            },
            customer: {
              displayName: 'Customer',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 120 // <- width in pixels
            },
            supplier: {
              displayName: 'Supplier',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 120 // <- width in pixels
            },
            material: {
              displayName: 'Material',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 120 // <- width in pixels
            },
            type: {
              displayName: 'Tipe Kendaraan',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              cellFormat: function (value, row) { // <- Renderer function, you can access also any row.property
                return (value) ? 'Truk Kecil' : 'Truk Besar';
              },
              width: '15' // <- width in pixels
            },
            record: {
              displayName: 'Nomor Record',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: '14' // <- width in pixels
            },
            date: {
              displayName: 'Tanggal',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: '10' // <- width in pixels
            },
            time: {
              displayName: 'Waktu',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: '6' // <- width in pixels
            },
            bruto: {
              displayName: 'Berat Kotor',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 100 // <- width in pixels
            },
            tara: {
              displayName: 'Berat Unit',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 100 // <- width in pixels
            },
            netto: {
              displayName: 'Berat Bersih',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 100 // <- width in pixels
            },
          } : {
            number: {
              displayName: 'No',
              headerStyle: styles.headerBold,
              cellStyle: function (value, row) {
                return (typeof row.number === 'string') ? styles.headerBold : styles.borderStyle; // <- Inline cell style is possible 
              },
              width: 25 // <- width in pixels
            },
            license: {
              displayName: 'No Polisi',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 90 // <- width in chars (when the number is passed as string)
            },
            customer: {
              displayName: 'Customer',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 120 // <- width in pixels
            },
            supplier: {
              displayName: 'Supplier',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 120 // <- width in pixels
            },
            material: {
              displayName: 'Material',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 120 // <- width in pixels
            },
            record: {
              displayName: 'Nomor Record',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: '14' // <- width in pixels
            },
            date: {
              displayName: 'Tanggal',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: '10' // <- width in pixels
            },
            time: {
              displayName: 'Waktu',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: '6' // <- width in pixels
            },
            bruto: {
              displayName: 'Berat Kotor',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 100 // <- width in pixels
            },
            tara: {
              displayName: 'Berat Unit',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 100 // <- width in pixels
            },
            netto: {
              displayName: 'Berat Bersih',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 100 // <- width in pixels
            },
          }
          const dataset = []
          const filteredData = scales.filter(a => a.status === 'completed')
          let brutoTotal = 0
          let taraTotal = 0
          let nettoTotal = 0
          for (let i = 0; i < filteredData.length; i++) {
            const data = filteredData[i]
            const number = i + 1
            const bruto = data.entry_weight > data.exit_weight ? data.entry_weight : data.exit_weight
            const tara = data.entry_weight > data.exit_weight ? data.exit_weight : data.entry_weight
            const netto = Math.abs(data.exit_weight - data.entry_weight)
            brutoTotal += bruto
            taraTotal += tara
            nettoTotal += netto
            dataset.push({
              ...data,
              date: formatDate(data.exit_date),
              time: formatTime(data.exit_date),
              customer: data.customer || "-",
              supplier: data.supplier || "-",
              number,
              bruto,
              tara,
              netto,
              record: parseInt(data.record)
            }
            )
            if (i === filteredData.length - 1) {
              dataset.push({
                number: 'Total',
                bruto: brutoTotal,
                tara: taraTotal,
                netto: nettoTotal,
              })
            }
          }
          const merges = [
            { start: { row: filteredData.length + 2, column: 1 }, end: { row: filteredData.length + 2, column: 9 } }
          ]
          const report = excel.buildExport(
            [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
              {
                name: 'Report', // <- Specify sheet name (optional)
                // heading: heading, // <- Raw heading array (optional)
                merges: merges, // <- Merge cell ranges
                specification: specification, // <- Report specification
                data: dataset // <-- Report data
              }
            ]
          );
          res.setHeader('Content-disposition', 'attachment; filename=Report.xlsx');
          res.send(report);
        } else {
          const specification = {
            number: {
              displayName: 'No',
              headerStyle: styles.headerBold,
              cellStyle: function (value, row) {
                return (typeof row.number === 'string') ? styles.headerBold : styles.borderStyle; // <- Inline cell style is possible 
              },
              width: 25 // <- width in pixels
            },
            license: {
              displayName: 'No Polisi',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 90 // <- width in chars (when the number is passed as string)
            },
            customer: {
              displayName: 'Customer',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 120 // <- width in pixels
            },
            supplier: {
              displayName: 'Supplier',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 120 // <- width in pixels
            },
            material: {
              displayName: 'Material',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 120 // <- width in pixels
            },
            record: {
              displayName: 'Nomor Record',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: '14' // <- width in pixels
            },
            date: {
              displayName: 'Tanggal',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: '10' // <- width in pixels
            },
            time: {
              displayName: 'Waktu',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: '6' // <- width in pixels
            },
            weight: {
              displayName: 'Berat',
              headerStyle: styles.headerBold,
              cellStyle: styles.borderStyle,
              width: 100 // <- width in pixels
            },
          }
          const dataset = []
          const filteredData = scales
          let weightTotal = 0
          for (let i = 0; i < filteredData.length; i++) {
            const data = filteredData[i]
            const number = i + 1
            weightTotal += data.weight
            dataset.push({
              ...data,
              customer: data.customer || "-",
              supplier: data.supplier || "-",
              date: formatDate(data.entry_date),
              time: formatTime(data.entry_date),
              number,
              weight: data.weight,
              record: parseInt(data.record)
            }
            )
            if (i === filteredData.length - 1) {
              dataset.push({
                number: 'Total',
                weight: weightTotal,
              })
            }
          }
          const merges = [
            { start: { row: filteredData.length + 2, column: 1 }, end: { row: filteredData.length + 2, column: 8 } }
          ]
          const report = excel.buildExport(
            [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
              {
                name: 'Report', // <- Specify sheet name (optional)
                merges: merges, // <- Merge cell ranges
                specification: specification, // <- Report specification
                data: dataset // <-- Report data
              }
            ]
          );
          res.setHeader('Content-disposition', 'attachment; filename=Report.xlsx');
          res.send(report);
        }
      }

    } else return res.status(200).send(payload)
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.post('/', async (req, res) => {
  try {
    const {
      body: { license, entry_weight, weight, material, customer, supplier, notes, type, location },
      user
    } = req
    if (!await verifyAuthority()) throw new Error('APP_EXPIRED')
    if (!user) throw new Error('UNAUTHORIZED')
    const record = formatRecord(await Scale.find({}).countDocuments().exec())
    if (
      (license && typeof license !== 'string') ||
      (customer && supplier) ||
      (customer && typeof customer !== 'string') ||
      (supplier && typeof supplier !== 'string') ||
      (material && typeof material !== 'string') ||
      (type && typeof type !== 'number') ||
      (location && typeof location !== 'string')
    ) throw new Error('INVALID_REQUEST')
    if (customer && !(await Customer.findOne({ name: customer.toLowerCase() }).exec())) {
      const newCustomer = new Customer({
        name: customer.toLowerCase()
      })
      await newCustomer.save()
    }
    if (supplier && !(await Supplier.findOne({ name: supplier.toLowerCase() }).exec())) {
      const newSupplier = new Supplier({
        name: supplier.toLowerCase()
      })
      await newSupplier.save()
    }
    if (material && !(await Material.findOne({ name: material.toLowerCase() }).exec())) {
      const newMaterial = new Material({
        name: material.toLowerCase()
      })
      await newMaterial.save()
    }
    const NewScale = new Scale({
      record,
      license,
      entry_weight,
      weight,
      material,
      customer: customer ? customer.toLowerCase() : undefined,
      supplier: supplier ? supplier.toLowerCase() : undefined,
      notes,
      type,
      operator: user.username,
      status: 'inside',
      entry_date: new Date(),
      location
    })
    await NewScale.save()
    return res.status(200).send({ message: 'SUCCESS', data: NewScale })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.put('/upload-images/:_id', async (req, res) => {
  try {
    const {
      params: { _id },
      body: { images }
    } = req
    const scale = await Scale.findOne({ _id }).exec()
    if (!scale) throw new Error('DATA_NOT_EXIST')

    for (const image of images) {
      const digestAuth = new AxiosDigestAuth({
        username: `${image.username}`,
        password: `${image.password}`,
      });

      const response = await digestAuth.request({
        headers: { Accept: "*/*" },
        responseType: "arraybuffer",
        method: "GET",
        url: `http://${image.ip}/ISAPI/Streaming/channels/1/picture`,
        timeout: 3000
      });

      if (response.status === 200) {
        const data = Buffer.from(response.data, "binary");
        await createFolder(path.join(`${__dirname}/../files/${_id}`))
        await fs.writeFile(path.join(`${__dirname}/../files/${_id}/${image.label}`), data)
      }
    }

    if (scale.exit_weight) {
      scale.exit_photos = images?.map((a) => `/files/${_id}/${a.label}`)
    } else if (scale.entry_weight) {
      scale.entry_photos = images?.map((a) => `/files/${_id}/${a.label}`)
    } else {
      scale.photos = images?.map((a) => `/files/${_id}/${a.label}`)
    }

    await Scale.updateOne({ _id }, { $set: scale }).exec()
    return res.status(200).send({ message: 'SUCCESS', data: scale })
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.put('/upload-datas', async (req, res) => {
  try {
    if (!await verifyAuthority()) throw new Error('APP_EXPIRED')
    const datas = await Scale.find({ uploaded: false }).exec()
    if (datas.length) {
      const requests = []
      for (const data of datas) {
        if ((typeof data.entry_weight === 'number' && typeof data.exit_weight === 'number') || typeof data.weight === 'number') {
          const photos = [...(data.entry_photos || []), ...(data.exit_photos || []), ...(data.photos || [])]
          const form = new FormData()
          for (const photo of photos) {
            const contents = createReadStream(path.join(__dirname, `../${photo}`));
            form.append('files', contents)
            form.append('images', photo?.split("/").reverse()[0])
          }
          requests.push({
            id: data._id,
            data: {
              url: `${process.env.NODE_ENV === 'production' ? `https://${req.query.url}/api` : process.env.CENTER_URL}/scales`,
              payload: data
            },
            image: {
              url: `${process.env.NODE_ENV === 'production' ? `https://${req.query.url}/api` : process.env.CENTER_URL}/scales/upload-images/`,
              payload: form,
              headers: form.getHeaders()
            }
          })
        }
      }
      for (const request of requests) {
        try {
          const result = await axios.post(request.data.url, request.data.payload)
          if (result.status < 400) {
            axios.put(`${request.image.url}${result.data._id}`, request.image.payload, { headers: request.image.headers })
            Scale.updateOne({ _id: request.id }, {
              $set: { uploaded: true }
            }).exec()
          }
        } catch (e) { }
      }
    }
    return res.status(200).send()
  } catch (e) {
    return errorHandler(e, res)
  }
})

router.put('/:_id', async (req, res) => {
  const {
    params: { _id },
    body: { exit_weight, material, customer, supplier, notes, license },
    user
  } = req
  try {
    if (!await verifyAuthority()) throw new Error('APP_EXPIRED')
    if (!user) throw new Error('UNAUTHORIZED')
    const scale = await Scale.findOne({ _id }).exec()
    if (!scale) throw new Error('DATA_NOT_EXIST')
    if (material && typeof material === 'string') scale.material = material
    if (notes && typeof notes === 'string') scale.notes = notes
    if (customer && typeof customer === 'string') {
      scale.supplier = ''
      scale.customer = customer.toLowerCase()
      if (!await Customer.findOne({ name: customer.toLowerCase() }).exec()) {
        const newCustomer = new Customer({
          name: customer.toLowerCase()
        })
        await newCustomer.save()
      }
    }
    if (supplier && typeof supplier === 'string') {
      scale.customer = ''
      scale.supplier = supplier.toLowerCase()
      if (!await Supplier.findOne({ name: supplier.toLowerCase() }).exec()) {
        const newSupplier = new Supplier({
          name: supplier.toLowerCase()
        })
        await newSupplier.save()
      }
    }
    scale.exit_weight = exit_weight
    scale.exit_date = new Date()
    scale.status = 'completed'
    scale.operator = user.username
    scale.license = license
    await Scale.updateOne({ _id }, { $set: scale }).exec()
    return res.status(200).send({ message: 'SUCCESS', data: scale })
  } catch (e) {
    errorHandler(e, res)
  }
})

router.delete('/:_id', async (req, res) => {
  const {
    params: { _id },
    user
  } = req
  try {
    if (!await verifyAuthority()) throw new Error('APP_EXPIRED')
    if (!user || (user.role !== 'admin' && user.role !== 'owner')) throw new Error('UNAUTHORIZED')
    const scale = await Scale.findOne({ _id }).exec()
    if (scale.status === 'completed')
      await Scale.updateOne({ _id }, {
        $set: { deleted: true }
      }).exec()
    else
      await Scale.deleteOne({ _id }).exec()
    return res.status(200).send({ message: 'SUCCESS' })
  } catch (e) {
    return errorHandler(e, res)
  }
})


module.exports = router