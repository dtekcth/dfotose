import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// A user is also considered an author
const userSchema = new Schema({
  username: {type: String, required: true, unique: true},
  password: {type: String, required: true},

  fullname: {type: String, required: true},

  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
});

// Update updated_at parameter
userSchema.pre('save', function (next) {
  var now = new Date();

  this.updated_at = now;

  next();
});

const User = mongoose.model('User', userSchema);
export default User;
