const BlogList = require('../models/blog_list')
const User = require('../models/user')
const bcrypt = require('bcrypt')

const initialBlogNotes = [
  {
    title: 'html is easy',
    author: 'Ibrahim',
    url: 'http://htmliseasy.com',
    likes: 504
  },
  {
    title: 'javascipt promise heck',
    author: 'arthur magelli',
    url: 'http://javasciptpromiseheck.com',
    likes: 1073
  },
  {
    title: 'the hardest thing in the world',
    author: 'sadi',
    url: 'http://thehardestthingintheworld.com',
    likes: 20131
  }
]

const nonExistingId = async () => {
  const blogNote = new BlogList({ title:'to be removed', url: 'http://nothing.com' })
  await blogNote.save()
  await blogNote.deleteOne()

  return blogNote._id.toString()
}

const blogNotesInDb = async () => {
  const blogNotes = await BlogList.find({})
  return blogNotes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(user => user.toJSON())
}

const createRootUser = async () => {
  await User.deleteMany({})

  const passwordHash = await bcrypt.hash('sekret', 10)
  const user = new User({ username: 'root', passwordHash })

  const rootUser = await user.save()
  return rootUser
}

const getRootUser = async () => {
  const user = await User.findOne({ username: 'root' })
  return user.toJSON()
}

module.exports = {
  initialBlogNotes,
  nonExistingId,
  blogNotesInDb,
  usersInDb,
  createRootUser,
  getRootUser,
}