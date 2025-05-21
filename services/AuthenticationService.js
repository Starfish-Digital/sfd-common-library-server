/* eslint-disable no-unused-vars */
const Service = require('./Service');
// const jwtDecode = require('jwt-decode');
const { jwtDecodeHelper, verifyJwtcheck } = require('../utils/utility.helper');
const jwt = require('jsonwebtoken');
const logger = require('../logger');
const Boom = require('@hapi/boom');
/**
* Check if a JWT token has expired
*
* jwtRequest JwtRequest  (optional)
* returns successResponseCheckJwtExpiry
* */


const checkJwtExpiry = async (request, response) => {
  try {
    const { jwtToken } = request.body;

    const decoded = jwtDecodeHelper(jwtToken);

    // If decoding failed and jwtDecodeHelper returned an error message
    if (!decoded || decoded.success === false) {
      throw {
        status: 400,
        message: decoded?.message || 'Invalid JWT token',
      };
    }

    return response.status(200).json(Service.successResponse({
      decodedPayload: decoded
    }));
  } catch (e) {
    return response.status(e.status || 500).json(Service.serverResponse(
      e.message || 'Server Error',
      e.status || 500
    ));
  }
};



/**
* Update the token using the refresh token
*
* refreshTokenRequest RefreshTokenRequest  (optional)
* returns successResponseAuthToken
* */

const refreshToken = async (request, response) => {
  try {

    const { access_Token } = request.body;


    if (!access_Token) {


      return response.status(400).json(Service.badRequestResponse('Token is required', 400));
    }

    const payload = jwt.decode(access_Token);

    if (!payload) {
      console.log('Invalid token payload');
      return response.status(400).json(Service.badRequestResponse('Invalid token payload', 400));
    }




    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp && payload.exp < currentTime;

    console.log(`Current time: ${currentTime}, Token expires at: ${payload.exp}, Expired: ${isExpired}`);


    if (!isExpired) {

      return response.status(200).json(Service.successResponse({
        message: 'Token is still valid — no need to refresh.',
        token: access_Token,
      }));
    }


    delete payload.exp;
    delete payload.iat;


    const newToken = jwt.sign(payload, 'dummy-secret', { expiresIn: '15m' });




    return response.status(200).json(Service.successResponse({
      message: 'Token refreshed successfully.',
      token: newToken,
    }));

  } catch (err) {



    const statusCode = err.status || 500;


    logger.error('Error occurred while refreshing token:', err);


    return response.status(statusCode).json(Service.serverResponse(err.message || 'Something went wrong during token refresh.', statusCode));
  }
};
/**
* Verify a JWT token using a public key
*
* jwtVerifyRequest JwtVerifyRequest  (optional)
* returns successResponseVerifyJwt
* */

const verifyJwt = async (request, response) => {
  const { jwtToken, publicKey } = request.body;

  if (!jwtToken || !publicKey) {
    return response.status(400).json(Service.rejectResponse(
      { reason: 'Both jwtToken and publicKeyName are required' },
      400,
      'Bad Request'
    ));
  }

  try {
    const decoded = await verifyJwtcheck(jwtToken, publicKey);

    return response.status(200).json(Service.successResponse({
      success: true,
      message: 'JWT publicKey verified successfully',
      data: decoded
    }));
  } catch (error) {
    return response.status(401).json(Service.rejectResponse(
      { reason: error.message || 'JWT verification failed' },
      401,
      'Unauthorized'
    ));
  }
};


module.exports = {
  checkJwtExpiry,
  refreshToken,
  verifyJwt
};
