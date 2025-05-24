/* eslint-disable no-unused-vars */
const Service = require('./Service');
const AWS = require('aws-sdk');
const path = require('path');
const s3 = new AWS.S3({ region: 'ap-southeast-1' });
const BUCKET_NAME = 'dev-certificates-bucket';
/**
* Get public key by Key ID (kid)
*
* kid String Provide kid
* certificatePath String s3/dev-certificates-bucket
* returns successResponseKid
* */

// const getPublicKeyByKid = async (request, response) => {
//   const { kid, certificatePath } = request.query
//   if (!kid || !certificatePath) {

//     return response.status(400).json(Service.badRequestResponse('Both "kid" and "certificatePath" are required', 400));
//   }

//   try {


//     const listResult = await s3.listObjectsV2({
//       Bucket: BUCKET_NAME,
//       Prefix: certificatePath,
//     }).promise();

//     if (!listResult.Contents || listResult.Contents.length === 0) {

//       return response.status(404).json(Service.rejectResponse('No files found under path: "${certificatePath}', 404));

//     }

//     const matchedFile = listResult.Contents.find(obj => {
//       const filename = path.basename(obj.Key);
//       return filename.startsWith(kid);
//     });

//     if (!matchedFile) {

//       return response.status(404).json(Service.rejectResponse('No file starting with "${kid}" found in path "${certificatePath}', 404));

//     }

//     const keyPath = matchedFile.Key;


//     const s3Object = await s3.getObject({
//       Bucket: BUCKET_NAME,
//       Key: keyPath,
//     }).promise();

//     if (!s3Object.Body) {

//       return response.status(404).json(Service.rejectResponse('S3 object at "${keyPath}" is empty or missing content', 404));

//     }

//     const publicKeyContent = s3Object.Body.toString('utf-8');

//     return response.status(200).json(Service.successResponse({
//       kid,
//       keyPath,
//       publicKey: publicKeyContent,
//     }));

//   } catch (error) {
//     return response.status(401).json(Service.rejectResponse(
//       { reason: error.message || 'JWT verification failed' },
//       401,
//       'Unauthorized'
//     ));
//   }
// };

const getPublicKeyByKid = async (request, response) => {
  try {
    const { kid, certificatePath } = request.body;  // POST body se params le rahe hain

    if (!kid || !certificatePath) {
      return response.status(400).json(
        Service.badRequestResponse('Both "kid" and "certificatePath" are required', 400)
      );
    }

    const pathParts = certificatePath.split('/');
    if (pathParts.length < 2 || pathParts[0] !== 's3') {
      return response.status(400).json(
        Service.rejectResponse('Invalid certificatePath format. Expected: s3/bucket-name/optional/path', 400)
      );
    }

    const bucketName = pathParts[1];
    const prefix = pathParts.slice(2).join('/');

    const listResult = await s3.listObjectsV2({
      Bucket: bucketName,
      Prefix: prefix,
    }).promise();

    if (!listResult.Contents || listResult.Contents.length === 0) {
      return response.status(404).json(
        Service.rejectResponse(`No files found under path: "${certificatePath}"`, 404)
      );
    }

    const matchedFile = listResult.Contents.find(obj => {
      const filename = require('path').basename(obj.Key);
      return filename.startsWith(kid);
    });

    if (!matchedFile) {
      return response.status(404).json(
        Service.rejectResponse(`No file starting with "${kid}" found in "${certificatePath}"`, 404)
      );
    }

    const keyPath = matchedFile.Key;

    const s3Object = await s3.getObject({
      Bucket: bucketName,
      Key: keyPath,
    }).promise();

    if (!s3Object.Body) {
      return response.status(404).json(
        Service.rejectResponse(`File "${keyPath}" is empty or unreadable`, 404)
      );
    }

    const publicKeyContent = s3Object.Body.toString('utf-8');

    return response.status(200).json(Service.successResponse({
      kid,
      keyPath,
      publicKey: publicKeyContent,
    }));

  } catch (error) {
    return response.status(500).json(
      Service.rejectResponse(
        { reason: error.message || 'Unexpected error occurred' },
        500,
        'Internal Server Error'
      )
    );
  }
};
module.exports = {
  getPublicKeyByKid,
};
