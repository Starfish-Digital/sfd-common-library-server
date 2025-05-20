// class Service {
//   static rejectResponse(error, code = 500) {
//     return { error, code };
//   }

//   static successResponse(payload, code = 200) {
//     return { payload, code };
//   }
// }

// module.exports = Service;
const HttpStatus = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
};

class Service {
  static rejectResponse(reason = 'No data found', code = 404, message = '') {
    // Default message based on status code
    message = message || HttpStatus[code] || 'Unknown Error';
    return {
      success: false,
      meta: {
        code,
        message
      },
      data: {
        reason
      }
    };
  }

  // Success response
  static successResponse(payload = {}, code = 200, message = '') {
    message = message || HttpStatus[code] || 'Success';
    return {
      success: true,
      meta: {
        code,
        message
      },
      data: payload
    };
  }
  static serverResponse(reason = 'No data found', code = 500, message = '') {
    message = message || HttpStatus[code] || 'Unknown Error';

    return {
      success: false,
      meta: {
        code,
        message
      },
      data: {
        reason
      }
    };
}

static badRequestResponse(reason = 'Invalid input data', code = 400, message = '') {
  message = message ||  HttpStatus[code] || 'Bad Request';

  return {
    success: false,
    meta: {
      code,
      message
    },
    data: {
      reason
    }
  };
}

}
module.exports = Service;

