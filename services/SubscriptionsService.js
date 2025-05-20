/* eslint-disable no-unused-vars */
const Service = require('./Service');
const { connectDB } = require('../utils/db')

/**
* Get subscription data by subscriptionId and institutionId
*
* subscriptionId String Provide subscriptionId (optional)
* consentId String Provide consentId (optional)
* userUuid String Provide userUuid (optional)
* institutionId String Provide institutionId (optional)
* returns successResponseConsents
* */

const getSubscriptionBySubscriptionId = (request, response) => new Promise(
  async (resolve, reject) => {
    const { subscriptionId, consentId, userUuid, institutionId } = request.query;

    if (!subscriptionId) {


      return response.status(400).json(Service.rejectResponse('Missing required field: subscriptionId', 400));
    }

    try {

      const db = await connectDB();



      const searchQuery = { subscriptionId };
      if (consentId) searchQuery.consentId = consentId;
      if (userUuid) searchQuery.userUuid = userUuid;
      if (institutionId) searchQuery.institutionId = institutionId;



      const subscriptionData = await db.collection('subscription').findOne(searchQuery);

      if (!subscriptionData) {


        return response.status(404).json(Service.rejectResponse('Subscription not found', 404));

      }



      return response.status(200).json(Service.successResponse({ subscriptionData }));

    } catch (e) {
      console.error('JWT expiry check error:', e);

      return response.status(e.status || 400).json(Service.serverResponse(
        e.message || 'Server Error',
        e.status || 400
      ));
    }
  },
);

module.exports = {
  getSubscriptionBySubscriptionId,
};
