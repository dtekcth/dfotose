const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const imageSchema = new Schema({
  filename: {type: String, required: true, unique: true},

  authorCid: {type: String, required: true, index: true},
  author: {type: String, required: false},

  galleryId: {type: String},

  thumbnail: {type: String},
  preview: {type:String},
  fullSize: {type: String},

  isGalleryThumbnail: {type: Boolean, default: false},

  tags: [String],

  shotAt: {type: Date, default: Date.now},
  exifData: Schema.Types.Mixed,

  created_at: {type: Date, default: Date.now}
});

imageSchema.index({ galleryId: 1, shotAt: 1 });
imageSchema.index({ authorCid: 1, shotAt: 1 });
imageSchema.index({ galleryId: 1, isGalleryThumbnail: 1 });
imageSchema.index({ tags: 1 });
imageSchema.index({ shotAt: 1 });
imageSchema.index({ author: 1 });

const Image = mongoose.model('Image', imageSchema);
module.exports = Image;
