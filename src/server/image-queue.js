const Queue = require('bull');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs-extra');
const moment = require('moment');
const _ = require('lodash');

// Connect to your existing Redis
const imageQueue = new Queue('image processing', {
  redis: {
    host: 'redis', // Docker service name
    port: 6379
  }
});

// Configure Sharp for better performance
sharp.cache({ memory: 256 });
sharp.concurrency(2); // Limit concurrent operations
sharp.simd(true); // Enable SIMD for faster processing

// Process images in the background
imageQueue.process(2, async (job) => { // Process 2 jobs concurrently
  const { 
    fullSizeImagePath, 
    galleryPath, 
    filename, 
    extension, 
    userCid, 
    galleryId, 
    userFullname 
  } = job.data;

  try {
    const thumbnailPath = path.resolve(galleryPath, "thumbnails", `${filename}.${extension}`);
    const previewPath = path.resolve(galleryPath, "previews", `${filename}.${extension}`);

    // Process thumbnail and preview in parallel
    const [thumbnailResult, previewResult, exifData] = await Promise.all([
      // Generate thumbnail
      sharp(fullSizeImagePath)
        .rotate() // Auto-rotate based on EXIF
        .resize(300, 200, {
          fit: 'cover',
          position: 'entropy' // Smart cropping
        })
        .jpeg({ quality: 85, progressive: true }) // Progressive JPEG
        .toFile(thumbnailPath),
      
      // Generate preview
      sharp(fullSizeImagePath)
        .rotate()
        .resize(null, 800, {
          withoutEnlargement: true // Don't upscale small images
        })
        .jpeg({ quality: 90, progressive: true })
        .toFile(previewPath),
      
      // Read EXIF data
      readExifDataAsync(fullSizeImagePath)
    ]);

    Logger.info(`Processed thumbnail and preview for ${filename}`);

    // Save to database
    const shotAtUnformatted = _.get(exifData, 'tags.DateTimeOriginal');
    const shotAt = shotAtUnformatted ? moment(shotAtUnformatted) : moment();

    const newImage = new Image({
      filename: filename,
      authorCid: userCid,
      galleryId: galleryId,
      thumbnail: thumbnailPath,
      preview: previewPath,
      fullSize: fullSizeImagePath,
      shotAt: shotAt,
      exifData: exifData,
      author: userFullname || ''
    });

    await newImage.save();
    Logger.info(`Saved image ${filename} to database`);
    
    // Update job progress
    job.progress(100);
    
    return { success: true, filename };
  } catch (error) {
    Logger.error(`Error processing image ${filename}:`, error);
    throw error;
  }
});

// Helper to make readExifData promise-based
function readExifDataAsync(imagePath) {
  return new Promise((resolve) => {
    readExifData(imagePath, (exif) => {
      resolve(exif);
    });
  });
}

// Monitor queue events
imageQueue.on('completed', (job, result) => {
  Logger.info(`Image processing completed for ${result.filename}`);
});

imageQueue.on('failed', (job, err) => {
  Logger.error(`Image processing failed:`, err);
});

module.exports = imageQueue;
