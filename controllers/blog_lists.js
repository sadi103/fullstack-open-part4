const blogListRouter = require('express').Router()
const BlogList = require('../models/blog_list')
const middleware = require('../utils/middleware')


blogListRouter.get('/', async (request, response) => {
  const blogs = await BlogList
    .find({}).populate('user', { username: 1, name: 1 })
  response.json(blogs)
})

blogListRouter.post('/', middleware.userExtracter, async (request, response) => {
  const body = request.body
  const user = request.user

  const blogNote = new BlogList({
    ...body,
    user: user._id
  })

  const savedBlogNote = await blogNote.save()

  user.notes = user.notes.concat(savedBlogNote._id)
  await user.save()

  response.status(201).json(savedBlogNote)
})

blogListRouter.delete('/:blogId', middleware.userExtracter, async (request, response) => {
  const blogId = request.params.blogId
  const blog = await BlogList.findById(blogId)

  const user = request.user

  if (blog.user.toString() !== user._id.toString()) {
    return response.status(401).json({ error: 'unauthorized user' })
  }

  user.notes = user.notes.filter(id => id.toString() !== blogId)
  await user.save()

  await blog.deleteOne()
  response.status(204).end()
})

blogListRouter.put('/:id', async (request, response) => {
  const id = request.params.id
  const body = request.body

  const newBlogNote = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedNote = await BlogList.findByIdAndUpdate(id, newBlogNote, { new: true })
  response.json(updatedNote)
})

module.exports = blogListRouter