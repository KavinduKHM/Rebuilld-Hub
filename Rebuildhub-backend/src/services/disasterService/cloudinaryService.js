const cloudinary = require("../../config/cloudinary");
const streamifier = require("streamifier");

const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "rebuildhub_damage_reports", // organized folder for your project
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        // ⭐ RETURN ONLY THE URL (NOT THE FULL OBJECT)
        resolve(result.secure_url);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(stream);
  });
};

module.exports = { uploadToCloudinary };