const assert = require('node:assert')
const { test, describe, beforeEach, after } = require('node:test')
const app = require('../app')
const mongoose = require('mongoose')
const supertest = require('supertest')
const BlogList = require('../models/blog_list')
const helper = require('./test_helper')

const api = supertest(app)

describe('when there is initially some notes saved', () => {
  beforeEach(async () => {
    const rootUser = await helper.createRootUser() // This function deletes all existing users and saves a root user in DB

    await BlogList.deleteMany({})

    helper.initialBlogNotes.forEach(note => {
      note.user = rootUser._id
    })

    const blogs = await BlogList.insertMany(helper.initialBlogNotes)
    rootUser.notes = blogs.map(note => note._id)

    await rootUser.save()
  })

  describe('exercise 4.8', () => {
    test(`the application returns ${helper.initialBlogNotes.length} blog posts in JSON format`, async () => {
      const response = await api
        .get('/api/blogs')
        .expect(200)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.length, helper.initialBlogNotes.length)
    })
  })

  describe('exercise 4.9', () => {
    test('the unique identifier property of the blog posts is named id', async () => {
      const blogNotes = await helper.blogNotesInDb()

      assert(blogNotes[0].id)
    })
  })

  describe('exercise 4.10', () => {
    test('making an HTTP POST request to the /api/blogs URL by logged-in root user successfully creates a new blog post', async () => {

      const response = await api
        .post('/api/login')
        .send({ username: 'root', password: 'sekret' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const newNote = {
        title: 'javascript is the revolutionary programming language',
        author: 'Hamdan',
        url: 'http://javascriptrevolution.com',
        likes: 932,
      }

      await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${response.body.token}`)
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogNotes = await helper.blogNotesInDb()

      const titles = blogNotes.map(note => note.title)

      assert(titles.includes('javascript is the revolutionary programming language'))
      assert.strictEqual(blogNotes.length, helper.initialBlogNotes.length + 1)

      const rootUser = await helper.getRootUser()
      assert.strictEqual(rootUser.notes.length, helper.initialBlogNotes.length + 1)
    })
  })

  describe('exercise 4.11*', () => {
    test('if the likes property is missing from the request, it will default to the value 0', async () => {

      const rootData = await api
        .post('/api/login')
        .send({ username: 'root', password: 'sekret' })
        .expect(200)
        .expect('Content-Type', /application\/json/)


      const newNote = {
        title: 'Hello, world',
        author: 'Ahmad',
        url: 'http://ahmad.com'
      }

      const response = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${rootData.body.token}`)
        .send(newNote)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      assert.strictEqual(response.body.likes, 0)
    })
  })

  describe('exercise 4.12*', () => {
    test('if title or url properties are missing, backend responds with 400 status code', async () => {
      const rootData = await api
        .post('/api/login')
        .send({ username: 'root', password: 'sekret' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const newNote = {
        url: 'missing url property',
        author: 'me',
        likes: 324
      }

      const result = await api
        .post('/api/blogs')
        .set('Authorization', `Bearer ${rootData.body.token}`)
        .send(newNote)
        .expect(400)

      assert(result.body.error.includes('Path `' + `${ (newNote.url && 'title') || (newNote.title && 'url') }` + '` is required'))
    })
  })

  describe('exercise 4.13', () => {
    test('make sure a specific blog note is deleted', async () => {
      const blogNotesBefore = await helper.blogNotesInDb()

      // get root user
      const root = await helper.getRootUser()

      // peck a random note of his
      const rootNotes = root.notes
      const noteIdToDelete = rootNotes[Math.floor(Math.random() * rootNotes.length)].toString()

      // login as root
      const rootData = await api
        .post('/api/login')
        .send({ username: 'root', password: 'sekret' })
        .expect(200)
        .expect('Content-Type', /application\/json/)

      const deletedNote = await api
        .delete(`/api/blogs/${noteIdToDelete}`)
        .set('Authorization', `Bearer ${rootData.body.token}`)
        .expect(204)

      const blogNotesAfter = await helper.blogNotesInDb()

      const titles = blogNotesAfter.map(note => note.title)
      assert.strictEqual(blogNotesAfter.length, blogNotesBefore.length - 1)
      assert(!titles.includes(deletedNote.title))
    })
  })

  describe('exercise 4.14', () => {
    test('try changing likes count', async () => {
      const blogNotesBefore = await helper.blogNotesInDb()
      const firstNote = blogNotesBefore[0]

      const rand_int = Math.ceil(Math.random() * 4234134223)

      const newNote = {
        title: firstNote.title,
        author: firstNote.author,
        url: firstNote.url,
        likes: rand_int
      }

      const response = await api
        .put(`/api/blogs/${firstNote.id}`)
        .send(newNote)
        .expect(200)

      const updatedNote = response.body

      assert.notStrictEqual(updatedNote.likes, firstNote.likes)
    })

    test('try changing the blog title', async () => {
      const blogNotesBefore = await helper.blogNotesInDb()
      const firstNote = blogNotesBefore[0]

      const newTitle = 'this title doesn\'t exist'

      const newNote = {
        title: newTitle,
        author: firstNote.author,
        url: firstNote.url,
        likes: firstNote.likes
      }

      const response = await api
        .put(`/api/blogs/${firstNote.id}`)
        .send(newNote)
        .expect(200)

      const updatedNote = response.body

      assert.notStrictEqual(updatedNote.title, firstNote.title)
    })
  })

  describe('exercise 4.23*', () => {
    test('adding a blog fails with the proper status code 401 Unauthorized if a token is not provided', async () => {
      const newNote = {
        title: 'javascript is the revolutionary programming language',
        author: 'Hamdan',
        url: 'http://javascriptrevolution.com',
        likes: 932,
      }

      await api
        .post('/api/blogs')
        .send(newNote)
        .expect(401)
        .expect('Content-Type', /application\/json/)

      const blogNotes = await helper.blogNotesInDb()

      const titles = blogNotes.map(note => note.title)

      assert(!titles.includes('javascript is the revolutionary programming language'))
      assert.strictEqual(blogNotes.length, helper.initialBlogNotes.length)
    })
  })
})


after(async () => {
  await mongoose.connection.close()
})