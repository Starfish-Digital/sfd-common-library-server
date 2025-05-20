/* eslint-disable no-unused-vars */
// const { query } = require('winston');
const Service = require('./Service');
const { connectDB } = require('../utils/db')

/**
* Get onboarding TPP by institutionId
*
* institutionId String Provide institutionId (optional)
* returns successResponseTpp
* */
const getOnboardingTPPByInstitutionId = (request, response) => new Promise(

  async (resolve, reject) => {
    const { name } = request.query
    if (!name) {

      return reject(Service.rejectResponse('Missing required field: institutionId', 400));
    }
    try {

      const db = await connectDB();



      const TppData = await db.collection('onboardingTPP').findOne({ name });

      if (!TppData) {

        return response.status(404).json(Service.rejectResponse('TppData not found', 404));

      }
      return response.status(200).json(Service.successResponse({ TppData }));

    } catch (e) {


      return response.status(e.status || 400).json(Service.serverResponse(
        e.message || 'Server Error',
        e.status || 500
      ));
    }
  },
);

module.exports = {
  getOnboardingTPPByInstitutionId,
};
