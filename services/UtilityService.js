/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { compress, decompress, createHash, encrypt, decrypt } = require('../utils/utility.helper');
const { log } = require('winston');
const Boom = require('@hapi/boom');
/**
* Compress data using gzip algorithm
*
* compressRequest CompressRequest  (optional)
* returns successResponseEncode
* */


const compressData = (request, response) => new Promise(
  async (resolve, reject) => {
    try {
      const { data } = request.body;


      if (!data || typeof data !== 'string' || data == undefined) {

        return response.status(400).json(Service.badRequestResponse('Invalid input data', 400));

      }

      const compressedData = await compress(data);
      return response.status(200).json(Service.successResponse({ compressedData }));

    } catch (e) {


      return response.status(e.status || 500).json(Service.serverResponse(
        e.message || 'Server Error',
        e.status || 500
      ));
    }
  }
);

/**
* Create a secure hash (e.g., SHA-256) of payment data
*
* hashRequest HashRequest  (optional)
* returns successResponseHash
* */
const createHashData = (request, response) => new Promise(
  async (resolve, reject) => {
    const { data, algorithm } = request.body || {};
    console.log('data', data);

    try {
      const hashPayload = createHash(data, algorithm);


      if (!data || typeof data !== 'string' || data == undefined) {

        return response.status(400).json(Service.badRequestResponse('Invalid input data', 400));

      }
      return response.status(200).json(Service.successResponse({
        hashPayload
      }));

    } catch (e) {
      console.error('JWT expiry check error:', e);

      return response.status(e.status || 500).json(Service.serverResponse(
        e.message || 'Server Error',
        e.status || 500
      ));
    }
  },
);
/**
* Decompress data using gzip algorithm
*
* decompressRequest DecompressRequest  (optional)
* returns successResponseDecode
* */
const decompressData = (request, response) => new Promise(
  async (resolve, reject) => {
    const { data } = request.body;

    try {

      if (!data || typeof data !== 'string' || data == undefined) {

        return response.status(400).json(Service.badRequestResponse('Invalid input data', 400));

      }
      const decompressedData = await decompress(data);

      return response.status(200).json(Service.successResponse({
        decompressedData
      }));
    } catch (e) {
      console.error('JWT expiry check error:', e);

      return response.status(e.status || 500).json(Service.serverResponse(
        e.message || 'Server Error',
        e.status || 500
      ));
    }
  },
);


const encryptData = (request, response) => new Promise(
  async (resolve, reject) => {
    try {
      const { data, keyStr, ivStr } = request.body;


      if (!data || typeof data !== 'string') {

        return response.status(400).json(Service.badRequestResponse('Invalid input data', 400));

      }

      if (!keyStr || typeof keyStr !== 'string' || keyStr.length !== 32) {

        return response.status(400).json(Service.badRequestResponse('Invalid key string', 400));

      }

      if (!ivStr || typeof ivStr !== 'string' || ivStr.length !== 24) {

        return response.status(400).json(Service.badRequestResponse('Invalid IV string', 400));

      }

      const encryptResult = await encrypt(data, keyStr, ivStr);
      console.log('Encryption result:', encryptResult);


      return response.status(200).json(Service.successResponse({
        encryptData: encryptResult
      }));

    } catch (e) {


      return response.status(e.status || 500).json(Service.serverResponse(
        e.message || 'Server Error',
        e.status || 500
      ));
    }
  }
);



const decryptData = async (request, response) => {
  try {
    const { data, keyStr, ivStr } = request.body;





    if (!data || typeof data !== 'string') {

      return response.status(400).json(Service.badRequestResponse('Invalid input data', 400));
    }

    if (!keyStr || typeof keyStr !== 'string' || keyStr.length !== 32) {

      return response.status(400).json(Service.badRequestResponse('Invalid key string', 400));
    }

    if (!ivStr || typeof ivStr !== 'string' || ivStr.length !== 24) {

      return response.status(400).json(Service.badRequestResponse('Invalid IV string', 400));
    }


    const decryptResult = await decrypt(data, keyStr, ivStr);



    return response.status(200).json(Service.successResponse({ decryptData: decryptResult }));

  } catch (e) {



    if (e.message.includes('Invalid JWT')) {

      return response.status(401).json(Service.rejectResponse(
        'Invalid JWT: ' + e.message,
        401
      ));
    }


    return response.status(e.status || 500).json(Service.serverResponse(
      e.message || 'Server Error',
      e.status || 500
    ));
  }
};







module.exports = {
  compressData,
  createHashData,
  decompressData,
  encryptData,
  decryptData
};
