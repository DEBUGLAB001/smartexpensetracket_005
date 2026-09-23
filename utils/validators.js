const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const isStrongPassword = (password) => {
  return typeof password === 'string' && password.length >= 8;
};

const isPositiveNumber = (amount) => {
  return typeof amount === 'number' && amount > 0;
};

const isValidDate = (dateString) => {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
};

module.exports = {
  isValidEmail,
  isStrongPassword,
  isPositiveNumber,
  isValidDate
};
