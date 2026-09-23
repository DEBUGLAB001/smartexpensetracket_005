const extractMonthYear = (dateString) => {
  const date = new Date(dateString);
  return {
    month: date.getMonth() + 1, // 1-12
    year: date.getFullYear()
  };
};

module.exports = {
  extractMonthYear
};
