
const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { Credentials } = require("aws-sdk");
const envVariables = [
  `${process.env.ENV}-database-url`
]
const REGION = "ap-southeast-1";
const s3Client = new S3Client({ region: REGION });
const parameterStoreService = require('../services/parameter.service');

const { MongoClient } = require('mongodb');
const dbName = process.env.DB_NAME || 'AA';
async function connectDB(data) {

  try {
    const environmentData = await parameterStoreService.getparametersFromAWS(envVariables);
    const localFilePath = await schema(data);

       const client = new MongoClient(environmentData[`${process.env.ENV}-database-url`], {
      tlsCAFile: localFilePath,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    dbInstance = client.db(dbName);
    await client.connect()
    console.log('MongoDB connected successfully');
    return client;

  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    throw error;
  }
}

module.exports = connectDB;