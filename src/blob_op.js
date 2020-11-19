const { BlobServiceClient } = require('@azure/storage-blob');
const { promises, existsSync } = require('fs');
const tar = require('tar');
// const { BlobServiceClient } = require('@azure/storage-blob')

async function connectToContainer(connectionString, containerName) {
  const blobServiceClient = BlobServiceClient.fromConnectionString(
    connectionString,
  );
  const containerClient = blobServiceClient.getContainerClient(containerName);
  await containerClient.createIfNotExists();
  return containerClient;
}

async function uploadFileToContainer(
  filePath,
  blockBlobFolder,
  containerClient,
) {
  // check exist
  const isExists = existsSync(filePath);
  if (!isExists) {
    throw new Error('Target file or directory does not exist');
  }
  // check file type
  const stat = await promises.lstat(filePath);
  var newFilePath = filePath;
  if (!stat.isFile()) {
    if (filePath.endsWith('/')) {
      newFilePath = newFilePath.slice(0, -1);
    }
    newFilePath = newFilePath + '.tgz';
    await tar.c(
      {
        gzip: true,
        file: newFilePath,
      },
      [filePath],
    );
  }
  // Upload blob logic
  const processedBlockBlobFolder = blockBlobFolder.endsWith('/')
    ? blockBlobFolder
    : blockBlobFolder + '/';
  const blockBlobPath = processedBlockBlobFolder + newFilePath.split('/').pop();
  const blockBlobClient = containerClient.getBlockBlobClient(blockBlobPath);
  await blockBlobClient.uploadFile(newFilePath);
  return blockBlobClient.url;
}

module.exports = { connectToContainer, uploadFileToContainer };
