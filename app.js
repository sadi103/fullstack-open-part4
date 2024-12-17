const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
require('express-async-errors')
const config = require('./utils/config')
const blogListRouter = require('./controllers/blog_lists')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const userRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

mongoose.set('strictQuery', false)

mongoose.connect(config.MONGODB_URI)
  .then(() => {
    logger.info('connected to MongoDB')
  })
  .catch((error) => {
    logger.error('error connecting to MongoDB: ', error.message)
  })

app.use(cors())
app.use(express.json())
app.use(middleware.tokenExtracter)
app.use(middleware.requestLogger)

app.use('/api/users', userRouter)
app.use('/api/login', loginRouter)
app.use('/api/blogs', blogListRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app