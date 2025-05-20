const service = {};
const AWS = require('aws-sdk');

AWS.config.update({
  region: 'ap-southeast-1'

});

const ssm = new AWS.SSM();
service.getparametersFromAWS = getparametersFromAWS;
module.exports = service;

async function getparametersFromAWS(parameterName, parentSpan) {

  // const span = tracer.startSpan('getParameterFromAWS', {
  //   parent: parentSpan
  // });
  try {
   
      const params = {
        Names: parameterName,
        WithDecryption: true
      };
      const data = await ssm.getParameters(params).promise();
      const parameters = {};
      data.Parameters.forEach(parameter => {

        var value = parameter.Name;
        parameters[value] = parameter.Value;

      });
      return parameters;
   
  } catch (error) {
   
    throw error;
  } 
}