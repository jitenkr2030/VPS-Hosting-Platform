const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const generateTokens = (userId) => {
  // Access token - short lived (15 minutes)
  const accessToken = jwt.sign(
    { userId, type: 'access' },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );

  // Refresh token - long lived (7 days)
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};

const generateRandomToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

const generateEmailToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

const generatePasswordResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

module.exports = {
  generateTokens,
  verifyToken,
  generateRandomToken,
  hashToken,
  generateEmailToken,
  generatePasswordResetToken
};