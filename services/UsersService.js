/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { connectDB } = require('../utils/db')
/**
* Get users by userUuid
*
* emailId String Provide emailId (optional)
* onboardingTpp String Provide onboardingTpp (optional)
* consentId String Provide consentId (optional)
* userUuid String Provide userUuid (optional)
* institutionId String Provide institutionId (optional)
* returns successResponseUsers
* */
const getUsersByUserUuid = (request, response) => new Promise(

  async (resolve, reject) => {
    const { emailId, onboardingTpp, consentId, userUuid, institutionId } = request.query
    if (!userUuid) {

      return response.status(400).json(Service.rejectResponse('Missing required field: userUuid', 400));

    }
    try {

      const db = await connectDB();

      const searchQuery = { emailId };
      if (consentId) searchQuery.consentId = consentId;
      if (userUuid) searchQuery.userUuid = userUuid;
      if (institutionId) searchQuery.institutionId = institutionId;
      if (onboardingTpp) searchQuery.institutionId = onboardingTpp;
      console.log('Searching subscription with:', searchQuery);

      const userData = await db.collection('users').findOne(searchQuery);

      if (!userData) {

        return response.status(404).json(Service.rejectResponse('users data not found', 404));

      }


      return response.status(200).json(Service.successResponse({ userData }));

    } catch (e) {


      return response.status(e.status || 500).json(Service.rejectResponse(
        e.message || 'Invalid JWT',
        e.status || 500
      ));
    }
  },
);
/**
* Update users by userUuid
*
* userUuid String Provide userUuid (optional)
* updateuserRequest UpdateuserRequest  (optional)
* returns successResponseUsers
* */


const updateUsersByUserUuid = async (request, response) => {
  try {
    const { userUuid } = request.query;
    const updateuserRequest = request.body;

    if (!userUuid) {

      return response.status(400).json(Service.rejectResponse('Missing required field: userUuid', 400));
    }

    if (!updateuserRequest || typeof updateuserRequest !== 'object') {

      return response.status(400).json(Service.rejectResponse('Invalid update payload', 400));
    }


    const db = await connectDB();


    const updateResult = await db.collection('users').findOneAndUpdate(
      { userUuid },
      { $set: updateuserRequest },
      { returnDocument: 'after' }
    );

    if (!updateResult) {

      return response.status(404).json(Service.rejectResponse('User not found', 404));
    }


    return response.status(200).json(Service.successResponse({ updatedUser: updateResult }));

  } catch (e) {

    return response.status(500).json(Service.serverResponse(
      e.message || 'Server Error',
      e.status || 500
    ));
  }
};


module.exports = {
  getUsersByUserUuid,
  updateUsersByUserUuid,
};
