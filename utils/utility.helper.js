// helpers/utility.helper.js

const zlib = require('zlib');
const crypto = require('crypto');
const {jwtDecode} = require('jwt-decode');
const AWS = require('aws-sdk');
// const AWS = require('aws-sdk');
const secretsManager = new AWS.SecretsManager({ region: 'ap-southeast-1' });
const s3 = new AWS.S3({ region: 'ap-southeast-1' }); // Replace with your region
const BUCKET_NAME = 'dev-certificates-bucket'; 
const jwt = require('jsonwebtoken');

const compress = (data) => {
    return new Promise((resolve, reject) => {
      zlib.gzip(data, (err, result) => {
        if (err) {
          return reject(new Error('Compression failed'));
        }
        resolve(result.toString('base64')); 
      });
    });
  };
  


const decompress = (data) => {
  return new Promise((resolve, reject) => {
    try {
      const buffer = Buffer.from(data, 'base64');

      zlib.gunzip(buffer, (err, result) => {
        if (err) {
          console.error('Decompression error:', err);
          return reject('Decompression failed');
        }
        resolve(result.toString('utf8'));
      });
    } catch (e) {
      console.error('Invalid input for decompression:', e);
      reject('Invalid input for decompression');
    }
  });
};


// Helper for creating a SHA-256 hash
// const createHash = (data) => {
//   return crypto.createHash('sha256').update(data).digest('hex');
// };
const createHash = (data, algorithm) => {
  // Default to sha256 if no algorithm is provided
  const algo = algorithm || 'sha256';
  return crypto.createHash(algo).update(data).digest('hex');
};



function encrypt(plaintext, keyStr, ivStr) {
 
  const keyBytes = Buffer.from(keyStr, 'utf-8').slice(0, 32);

 
  const ivBytes = Buffer.from(ivStr, 'hex');
  if (ivBytes.length !== 12) {
    throw new Error('IV must be 12 bytes (24 hex characters)');
  }

  const cipher = crypto.createCipheriv('aes-256-gcm', keyBytes, ivBytes);

 
  let encrypted = cipher.update(plaintext, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  
  const combined = Buffer.concat([encrypted, authTag]);

  return combined.toString('base64');
}

function decrypt(encryptedBase64, keyStr, ivStr) {
 
  const keyBytes = Buffer.from(keyStr, 'utf-8').slice(0, 32);
  const ivBytes = Buffer.from(ivStr, 'hex');

  const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');

 
  const authTag = encryptedBuffer.slice(-16); // Last 16 bytes
  const ciphertext = encryptedBuffer.slice(0, -16); // All except last 16 bytes

  const decipher = crypto.createDecipheriv('aes-256-gcm', keyBytes, ivBytes);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext, null, 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}





const jwtDecodeHelper = (jwtToken) => {
  try {
    const token = typeof jwtToken === 'string' ? jwtToken : jwtToken.token;
    console.log('Extracted JWT token:', token);

    const decoded = jwtDecode(token);
    console.log('Decoded JWT payload:', decoded);

    const exp = decoded.exp;
    if (typeof exp === 'undefined') {
      console.log('No "exp" field found in token.');
      return {
        success: false,
        message: 'Token does not contain an expiry ("exp") field.',
        decodedPayload: decoded,
      };
    }

    console.log('JWT expiry (exp):', exp);
    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    console.log('Current time (seconds):', currentTime);

    const isExpired = exp < currentTime;
    console.log('Is token expired?:', isExpired);

    return {
      expired: isExpired,
      expiresAt: exp,
      message: isExpired ? 'JWT token is expired.' : 'JWT token is valid.',
    };
  } catch (error) {
    console.error('JWT decode error:', error);
    return {
      success: false,
      message: error.message || 'Invalid JWT',
    };
  }
};


const verifyJwtcheck = async (jwtToken, publicKeyName) => {
  if (!jwtToken || !publicKeyName) {
    throw new Error('Both jwtToken and publicKeyName are required');
  }

  try {
    console.log(`Fetching public key '${publicKeyName}' from S3...`);

    const s3Object = await s3.getObject({
      Bucket: BUCKET_NAME,
      Key: publicKeyName
    }).promise();

    const publicKeyContent = s3Object.Body.toString('utf-8');
    console.log('Public key retrieved.');

    const decoded = jwt.verify(jwtToken, publicKeyContent);
    console.log('JWT verified successfully.');

    return decoded;

  } catch (error) {
    if (error.code === 'NoSuchKey') {
      throw new Error(`Public key "${publicKeyName}" does not exist in S3.`);
    }

    console.error('Error verifying JWT:', error.message);
    throw new Error(error.message || 'JWT verification failed');
  }
};

module.exports = { compress, decompress, createHash ,encrypt, decrypt,jwtDecodeHelper, verifyJwtcheck};
