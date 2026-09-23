module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-for-development-only',
  JWT_EXPIRES_IN: '24h',
  CATEGORIES: [
    "Food",
    "Travel",
    "Education",
    "Shopping",
    "Health",
    "Entertainment"
  ]
};
