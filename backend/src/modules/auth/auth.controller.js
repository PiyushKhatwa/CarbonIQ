const authService = require('./auth.service');
const { sendSuccess, sendCreated } = require('../../utils/response.util');

async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    return sendCreated(res, result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    return sendSuccess(res, result);
  } catch (err) {
    next(err);
  }
}

async function getMe(req, res, next) {
  try {
    const user = await authService.getProfile(req.user.id);
    return sendSuccess(res, user);
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const updated = await authService.updateProfile(req.user.id, req.body);
    return sendSuccess(res, updated);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  register,
  login,
  getMe,
  updateMe,
};

