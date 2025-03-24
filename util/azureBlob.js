const { BlobServiceClient } = require("@azure/storage-blob");
const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const path = require("path");
const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(
  process.env.AZURE_STORAGE_CONTAINER_NAME
);

const uploadToAzure = async (file) => {
  const blobName = uuidv4() + "-" + file.originalname;
  const blockBlobClient = containerClient.getBlockBlobClient(blobName);
  await blockBlobClient.uploadData(file.buffer);
  return blockBlobClient.url;
};

const uploadFileToBlob = async (fileBuffer, fileName, fileType) => {
  try {
    const blobName = `${uuidv4()}${path.extname(fileName)}`;
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(fileBuffer, {
      blobHTTPHeaders: { blobContentType: fileType },
    });

    return blockBlobClient.url;
  } catch (error) {
    console.error("Azure Blob Upload Error:", error);
    throw new Error("Error uploading file to Azure Blob Storage");
  }
};

module.exports = { uploadToAzure, uploadFileToBlob };
