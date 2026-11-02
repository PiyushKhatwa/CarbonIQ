const bcrypt = require('bcryptjs');
const authRepo = require('./auth.repository');
const { generateToken } = require('../../utils/token.util');

const BCRYPT_SALT_ROUNDS = 12;

async function register({ email, password, fullName, defaultWorkspaceType }) {
  const existingUser = await authRepo.findUserByEmail(email);
  if (existingUser) {
    const error = new Error('An account with this email address already exists');
    error.statusCode = 409;
    error.code = 'EMAIL_ALREADY_EXISTS';
    throw error;
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
  const user = await authRepo.createUser({
    email,
    passwordHash,
    fullName,
    defaultWorkspaceType,
  });

  const token = generateToken({
    userId: user.id,
    email: user.email,
    systemRole: user.system_role,
  });

  return {
    user,
    token,
  };
}

async function login({ email, password }) {
  const user = await authRepo.findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password_hash);
  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    error.code = 'INVALID_CREDENTIALS';
    throw error;
  }

  const token = generateToken({
    userId: user.id,
    email: user.email,
    systemRole: user.system_role,
  });

  // Exclude password_hash
  const { password_hash, ...safeUser } = user;

  return {
    user: safeUser,
    token,
  };
}

async function getProfile(userId) {
  const user = await authRepo.findUserById(userId);
  if (!user) {
    const error = new Error('User not found');
    error.statusCode = 404;
    error.code = 'USER_NOT_FOUND';
    throw error;
  }
  return user;
}

async function updateProfile(userId, updateData) {
  return authRepo.updateUserProfile(userId, updateData);
}

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
};

