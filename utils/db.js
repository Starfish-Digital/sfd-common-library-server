const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Credentials } = require("aws-sdk");
const envVariables = [
  `${process.env.ENV}-database-url`
]
const REGION = "ap-southeast-1";
const s3Client = new S3Client({ region: REGION });
const parameterStoreService = require('../services/parameter.service');

const { MongoClient } = require('mongodb');
const fs = require('fs').promises;
const path = require('path');

async function schema(data) {

  const localFilePath = path.join("global-bundle.pem");

  try {

    const objectData = await fs.readFile(localFilePath, 'utf8');
    console.log('Data has been read from the local PEM file.');


    const tmpFilePath = path.join("/tmp", "global-bundle.pem");
    await fs.writeFile(tmpFilePath, objectData, 'utf8');
    console.log('Data has been written to the temporary file.');

    return tmpFilePath;
  } catch (err) {
    console.error('Error reading or writing the PEM file:', err.message);
    throw { code: 3003, message: `Error reading or writing the PEM file: ${err.message}` };
  }
}

const dbName = process.env.DB_NAME || 'AA';

async function mongodbConnection(data) {

  try {
    const environmentData = await parameterStoreService.getparametersFromAWS(envVariables);
    const localFilePath = await schema(data);

    const client = new MongoClient(environmentData[`${process.env.ENV}-database-url`], {
    

      tlsCAFile: localFilePath,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    await client.connect(dbName)
    return client;

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = mongodbConnection;
