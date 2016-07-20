import mongoose from 'mongoose';

const Schema = mongoose.Schema;

const gallerySchema = new Schema({
  name: {type: String, required: true},
  description: {type:String},

  created_at: {type: Date, default: Date.now}
});

const Gallery = mongoose.model('Gallery', gallerySchema);
export default Gallery;
