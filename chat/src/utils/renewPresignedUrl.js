import * as Minio from 'minio';

const renewPresignedUrl = async (objectName, bucketName) => {
  const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10),
    useSSL: process.env.MINIO_USE_SSL === 'true',
    accessKey: process.env.MINIO_ROOT_USER,
    secretKey: process.env.MINIO_ROOT_PASSWORD,
  });

  const expirationInSeconds = 7 * 24 * 60 * 60; // 7 days

  try {
    const url = await minioClient.presignedGetObject(bucketName, objectName, expirationInSeconds);

    // TODO: Store the new presigned URL in the database

    return url;
  } catch (error) {
    console.error('Error generating presigned URL:', error);
    throw error;
  }
};

export default renewPresignedUrl;
