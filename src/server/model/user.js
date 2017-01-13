import mongoose from 'mongoose';

const Schema = mongoose.Schema;

// A User is also considered an author
const userSchema = new Schema({
  cid: {type: String, required: true, unique: true},
  fullname: {type: String},

  // DEPRECATED - DO NOT USE
  dfotoMember: {type: Boolean, default: false},

  role: {type: String, required: false, default: 'None'},

  created_at: {type: Date, default: Date.now},
  updated_at: {type: Date, default: Date.now}
});

// Update updated_at parameter
userSchema.pre('save', function (next) {
  this.updated_at = new Date();

  next();
});

const User = mongoose.model('User', userSchema);
export default User;
