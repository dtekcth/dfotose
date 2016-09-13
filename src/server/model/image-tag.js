import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const imageTagSchema = new Schema({
  tagName: {type:String, required: true, index: true},
  imageId: {type:String, required: true, index: true},

  created_at: {type: Date, default: Date.now}
});

const ImageTag = mongoose.model('ImageTag', imageTagSchema);
export default ImageTag;
