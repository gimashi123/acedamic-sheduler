import { S3Client, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import multer from 'multer';
import multerS3 from 'multer-s3';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

dotenv.config();

// Initialize the S3 client properly
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const bucketName = process.env.AWS_S3_BUCKET_NAME;

// Define allowed file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, JPG and PNG files are allowed.'), false);
  }
};

// Configure multer for S3 upload
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: bucketName,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const userId = req.user._id;
      const userRole = req.user.role.toLowerCase();
      const fileExt = path.extname(file.originalname);
      const fileName = `${userRole}/profile-pictures/${userId}-${uuidv4()}${fileExt}`;
      cb(null, fileName);
    },
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB file size limit
  fileFilter,
}).single('profilePicture');

// Export the upload function
export const uploadToS3 = upload;

// Delete file from S3
export const deleteFileFromS3 = async (fileKey) => {
  const deleteParams = {
    Bucket: process.env.AWS_S3_BUCKET_NAME,
    Key: fileKey
  };
  
  return s3Client.send(new DeleteObjectCommand(deleteParams));
};

// Generate signed URL for private files (if needed)
export const generateSignedUrl = (key, expires = 3600) => {
  const params = {
    Bucket: bucketName,
    Key: key,
  };

  // Use the imported getSignedUrl function
  return getSignedUrl(s3Client, new GetObjectCommand(params), { expiresIn: expires });
}; 