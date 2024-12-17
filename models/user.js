const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, required: true, unique: true, minLength: 3 },
  passwordHash: { type: String, required: true },
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Blog'
    }
  ],
})

userSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    // the passwordHash should not be revealed
    delete returnedObject.passwordHash
  }
})


module.exports = mongoose.model('User', userSchema)