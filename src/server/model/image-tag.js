const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const imageTagSchema = new Schema({
  tagName: {type:String, required: true, index: true},
  imageId: {type:String, required: true, index: true},

  created_at: {type: Date, default: Date.now}
});

imageTagSchema.index({ tagName: 1, imageId: 1 });

const ImageTag = mongoose.model('ImageTag', imageTagSchema);
module.exports = ImageTag;
