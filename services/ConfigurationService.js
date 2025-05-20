/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { connectDB } = require('../utils/db');
// const { MongoClient } = require('mongodb');


/**
* Get institution configuration (schema table) by authorization URL,environmentType and institutionId
*
* environmentType String Provide environmentType (optional)
* authorizationUrl String Provide authorizationUrl (optional)
* institutionId String Provide institutionId (optional)
* returns successResponseConfig
* */

const getInstitutionConfig = async (request, response) => {
  try {


    const { targetEntity } = request.query;

    if (!targetEntity) {

      return response.status(400).json(Service.rejectResponse('Missing required fields: targetEntity', 400));
    }


    const db = await connectDB();



    const institutionConfig = await db.collection('schema').findOne({ targetEntity });

    if (!institutionConfig) {

      return response.status(404).json(Service.rejectResponse('Institution configuration not found', 404));
    }


    return response.status(200).json(Service.successResponse({
      institutionConfig
    }));
  } catch (e) {

    return response.status(e.status || 500).json(Service.serverResponse(
      e.message || 'Server Error',
      e.status || 500
    ));
  }
};


/**
* Get institution configuration (schema table) by authorization URL
*
* authorizationUrl String Provide authorizationUrl (optional)
* returns successResponseConfig
* */

const getInstitutionConfigByAuthorizationUrl = async (request, response) => {
  try {
    const { authorizationUrl } = request.query;


    if (!authorizationUrl) {

      return response.status(400).json(Service.rejectResponse('Missing required field: authorizationUrl', 400));
    }


    const db = await connectDB();



    const encodedUrl = encodeURIComponent(authorizationUrl);



    const institutionConfig = await db.collection('schema').findOne({
      'schemaMetaData.clientConfig.grantData.authorizationUrl': encodedUrl
    });

    if (!institutionConfig) {

      return response.status(404).json(Service.rejectResponse('Institution configuration not found', 404));
    }


    return response.status(200).json(Service.successResponse({
      institutionConfig
    }));
  } catch (e) {

    return response.status(e.status || 500).json(Service.serverResponse(
      e.message || 'Server Error',
      e.status || 500
    ));
  }
};


module.exports = {
  getInstitutionConfig,
  getInstitutionConfigByAuthorizationUrl,
};
