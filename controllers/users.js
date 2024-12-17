const userRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

userRouter.post('/', async (request, response) => {
  const { username, name, password } = request.body

  if (password?.length < 3) {
    return response.status(400).json({ error: 'Password too short. Should be at least 3 characters' })
  }

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    name,
    passwordHash,
  })

  const savedUser = await user.save()

  return response.status(201).json(savedUser)
})

userRouter.get('/', async (request, response) => {
  const users = await User
    .find({}).populate('notes', { title: 1, url: 1, likes: 1 })

  response.json(users)
})

module.exports = userRouter