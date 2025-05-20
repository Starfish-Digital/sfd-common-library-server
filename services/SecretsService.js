/* eslint-disable no-unused-vars */
const Service = require('./Service');
const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'ap-southeast-1' });
/**
* Get a secret by name
*
* secretName String Provide secretName
* returns successResponseSecrets
* */


const getSecretByName = async (request, response) => {
  try {
    const { secretName } = request.query;


    if (!secretName) {

      return response.status(400).json(Service.rejectResponse('Missing required field: secretName', 400));
    }


    const data = await secretsManager.getSecretValue({ SecretId: secretName }).promise();

    if (!data) {

      return response.status(400).json(Service.rejectResponse("Secrets Manager can't find the specified secret", 400));
    }
    let secretValue;
    if ('SecretString' in data) {
      secretValue = data.SecretString;
    } else {
      const buff = Buffer.from(data.SecretBinary, 'base64');
      secretValue = buff.toString('ascii');
    }




    return response.status(200).json(Service.successResponse({
      secrets: secretValue,
    }));
  } catch (e) {



    return response.status(e.statusCode || 500).json(Service.serverResponse(
      e.message || 'Failed to retrieve secret',
      e.statusCode || 500
    ));
  }
};

module.exports = {
  getSecretByName,
};
