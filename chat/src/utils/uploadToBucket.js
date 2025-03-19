import * as Minio from 'minio';
import fs from 'fs';
import path from 'path';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_HOST,
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ACCESS_KEY,
  secretKey: process.env.MINIO_SECRET_KEY,
});

const uploadToBucket = async (filePath, mimetype) => {
  const bucketName = mimetype.split('/')[0].toLowerCase();
  const fileName = path.basename(filePath);
  const fileStream = fs.createReadStream(filePath);
  const fileSize = fs.statSync(filePath).size;

  // Set expiration time to 7 days (604800 seconds)
  const expirationTime = 604800;

  try {
    // Ensure the bucket exists
    const bucketExists = await minioClient.bucketExists(bucketName);
    if (!bucketExists) {
      await minioClient.makeBucket(bucketName);
    }

    // Prepare metadata
    const metaData = {
      'Content-Type': mimetype,
      'X-Amz-Meta-Original-Filename': fileName,
      'X-Amz-Meta-File-Size': fileSize.toString(),
      'X-Amz-Meta-Upload-Date': new Date().toISOString(),
    };

    // Upload the file to Minio with metadata
    await minioClient.putObject(bucketName, fileName, fileStream, fileSize, metaData);

    // Generate the presigned URL for retrieval
    const presignedUrl = await minioClient.presignedGetObject(bucketName, fileName, expirationTime);
    
    await fs.promises.unlink(filePath);

    return {presignedUrl, bucketName};
  } catch (error) {
    console.error('Error uploading file or generating presigned URL:', error);
    throw error;
  }
};

export default uploadToBucket;
