/* eslint-disable no-unused-vars */
const Service = require('./Service');
const connectToMongoDB = require('../utils/db');
/**
* Get consets by accountId,bic,consentId,userUuid,institutionId and accountNumber
*
* accountId String Provide accountId (optional)
* bic String Provide bic (optional)
* consentId String Provide consentId (optional)
* userUuid String Provide userUuid (optional)
* institutionId String Provide institutionId (optional)
* accountNumber String provide accountNumber (optional)
* returns successResponseConsents
* */

const getConsentById = async (request, response) => {
  let mongoClient;
  try {

    const { accountId, bic, consentId, userUuid, institutionId, accountNumber } = request.query;


    if (!userUuid) {

      return response.status(400).json(Service.rejectResponse('Missing required field: userUuid', 400));
    }


    mongoClient = await connectToMongoDB();
    const db = mongoClient.db('AA');



    const searchQuery = { accountId };
    if (consentId) searchQuery.consentId = consentId;
    if (userUuid) searchQuery.userUuid = userUuid;
    if (institutionId) searchQuery.institutionId = institutionId;
    if (bic) searchQuery.bic = bic; // Corrected the field for bic
    if (accountNumber) searchQuery.accountNumber = accountNumber;




    const consentData = await db.collection('users').findOne(searchQuery);

    if (!consentData) {

      return response.status(404).json(Service.rejectResponse('Consent not found', 404));
    }


    return response.status(200).json(Service.successResponse({ consentData }));

  } catch (e) {

    return response.status(e.status || 500).json(Service.serverResponse(
      e.message || 'Server Error',
      e.status || 500
    ));
  }
  finally {
    if (mongoClient) {
      console.log('Closing MongoDB connection...');
      await mongoClient.close();
    }
  }
};


module.exports = {
  getConsentById,
};
