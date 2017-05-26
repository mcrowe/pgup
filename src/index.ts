import express = require('express')
import morgan = require('morgan')
import bodyParser = require('body-parser')
import pgp = require('pg-promise')

if (process.argv.length < 2) {
  console.log('Usage: pgup [connection_string]')
  process.exit(1)
}

const PORT = process.env.PORT || 3876
const DATABASE_URL = process.argv[1]

const db = pgp()(DATABASE_URL)

console.log('Connected to database at: ' + DATABASE_URL)

const app = express()

// Basic request logging
app.use(morgan('tiny'))

// Parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended: false}))

// Enable CORS on all resources
app.use((_req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept')
  next()
})

app.post('/query', async (req, res) => {
  const { sql } = req.body

  try {
    const data = await db.any(req.body.sql)
    res.status(200).json({error: null, data: data})
  } catch(e) {
    console.error(`Error running sql '${sql}': '${e}'`)
    res.status(500).json({error: e.message, data: null})
  }
})

app.listen(PORT, () => {
  console.log(`Ready and listening on port ${PORT}`)
})