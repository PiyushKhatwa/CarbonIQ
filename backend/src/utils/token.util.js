const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(payload, expiresIn = env.jwt.expiresIn) {
  return jwt.sign(payload, env.jwt.secret, { expiresIn });
}

function verifyToken(token) {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch (err) {
    return null;
  }
}

module.exports = {
  generateToken,
  verifyToken,
};

