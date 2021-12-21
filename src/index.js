const express = require('express')
require('dotenv').config()
const reporterRouter = require('./routers/reporter')
const newsRouter = require('./routers/new')
require('./db/mongoos.js')
const jwt = require('jsonwebtoken')


const app = express()

//parse automatic
app.use(express.json())
const port = process.env.PORT

app.use(reporterRouter)
app.use(newsRouter)

app.listen(port, () => {
    console.log('Server is running')
})