#!/usr/bin/env node

// TODO: implement meow cli for pai_ops.ts
// support upload and download command
// usage like: pai_copy upload [filePath] [containerName] [blobFolder]

const meow = require('meow');
const blobOp = require('./blob_op');
const dotenv = require('dotenv');

dotenv.config();
console.log(process.env.STORAGE_CONNECTION_STRING);

const cli = meow(
  `
    Usage
      $ pai_copy upload <filePath> <containerName> <blobFolder>
      p.s. connectionString should be set in STORAGE_CONNECTION_STRING environ in advance.

    Examples
      $ pai_copy upload
`,
  {
    flags: {
      // filepath: {
      //     type: "string",
      //     alias: "fp",
      // }
    },
  },
);

console.log(`${cli.input}`);

async function main(argv) {
  if (argv.length !== 4) {
    throw Error('Invalid number of arguments, please check usage by --help');
  }
  const func = argv[0];
  switch (func) {
    case 'upload': {
      // connect to container
      const containerName = argv[2];
      const connectionString = process.env.STORAGE_CONNECTION_STRING || '';
      console.log(connectionString);
      const containerClient = await blobOp.connectToContainer(
        connectionString,
        containerName,
      );

      // upload file
      const filePath = argv[1];
      const blobFolder = argv[3];
      await blobOp.uploadFileToContainer(filePath, blobFolder, containerClient);
      break;
    }
    default:
      throw Error('Unsupport function string, please check usage by --help');
  }
}

main(cli.input)
  .then(() => console.log('Done'))
  .catch((err) => console.log(err.message));
