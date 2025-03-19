import * as Minio from 'minio';
import fs from 'fs';
import path from 'path';
import {exec} from 'child_process';

const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_HOST,
  port: parseInt(process.env.MINIO_PORT) || 9000,
  useSSL: process.env.MINIO_USE_SSL === 'true',
  accessKey: process.env.MINIO_ROOT_USER,
  secretKey: process.env.MINIO_ROOT_PASSWORD,
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
      enableBucketEncryption(bucketName);
    }

    // Prepare metadata
    const metaData = {
      'Content-Type': mimetype,
      'X-Amz-Meta-Original-Filename': fileName,
      'X-Amz-Meta-File-Size': fileSize.toString(),
      'X-Amz-Meta-Upload-Date': new Date().toISOString(),
      'x-amz-server-side-encryption': 'AES256', // Enable SSE-S3
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

const enableBucketEncryption = (bucketName) =>{
  
  const command = `mc encrypt set sse-s3 myminio/${bucketName} --insecure`;

  exec(command, (error, stdout, stderr)=>{
    if(error){
       console.error(`Error enabling encryption: ${stderr}`);
      throw error;
    }
    console.log(`Encryption enabled for bucket: ${bucketName}`);
  });

};

export default uploadToBucket;

