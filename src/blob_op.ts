import { BlobServiceClient, ContainerClient } from "@azure/storage-blob";
import { promises, existsSync } from "fs";
import * as tar from "tar";
// const { BlobServiceClient } = require('@azure/storage-blob')

export async function connectToContainer(
    connectionString: string,
    containerName: string
) : Promise<ContainerClient> {
    const blobServiceClient =BlobServiceClient.fromConnectionString(connectionString);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const createContainerResponse = await containerClient.createIfNotExists();
    console.log(`Load container ${containerName} successfully`, createContainerResponse.requestId);
    return containerClient
}


async function isFile(path: string): Promise<any> {
    const stat = await promises.lstat(path)
    return stat.isFile();
}


export async function uploadFileToContainer(
    filePath: string, 
    blockBlobFolder: string,
    containerClient: ContainerClient
) : Promise<void> {
    // check exist
    const isExists = existsSync(filePath);
    if (!isExists) {
        throw "Target file or directory does not exist";
    }
    // check file type
    const stat = await promises.lstat(filePath)
    var newFilePath = filePath;
    if (!stat.isFile()) {
        newFilePath = newFilePath + ".tgz"
        await tar.c(
            {
              gzip: true,
              file: newFilePath
            },
            [filePath]
        )
        console.log(`${newFilePath} has been created`)
    }
    // console.log("entered unexpected branch")
    // TODO: add logic upload blob
    const processedBlockBlobFolder = blockBlobFolder.endsWith("/") ? blockBlobFolder : blockBlobFolder + "/";
    const blockBlobPath = processedBlockBlobFolder + newFilePath.split("/").pop()
    const blockBlobClient = containerClient.getBlockBlobClient(blockBlobPath)
    const uploadBlobResponse = await blockBlobClient.uploadFile(newFilePath)
    console.log(`Upload block blob ${blockBlobPath} successfully`, uploadBlobResponse.requestId);
    
}