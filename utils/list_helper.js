const _ = require('lodash')

const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}

const favoriteBlog = (blogs) => {
  if (blogs.length === 0) return null

  const topBlog = blogs.reduce((top, current) => {
    return current.likes > (top?.likes || Number.NEGATIVE_INFINITY) ? current : top
  }, null)

  return topBlog
    ? {
      title: topBlog.title,
      author: topBlog.author,
      likes: topBlog.likes,
    }
    : null
}

const mostBlogs = (blogs) => {
  if (blogs.length === 0) return null

  const counts = _.countBy(blogs, 'author')
  const topAuthor = _.maxBy(Object.entries(counts), ([, count]) => count)

  return {
    author: topAuthor[0],
    blogs: topAuthor[1]
  }
}

const mostLikes = (blogs) => {
  if (blogs.length === 0) return null

  const blogsByAuthors = _.groupBy(blogs, 'author')
  const topLikes = _.maxBy(Object.entries(blogsByAuthors), ([, blogsArray]) => _.sumBy(blogsArray, o => o.likes))

  const [author, blogsArray] = topLikes

  return {
    author,
    likes: _.sumBy(blogsArray, 'likes')
  }
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}