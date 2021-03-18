module.exports = function (shouldLog, ...messages) {
  if (shouldLog) {
    console.log(...messages);
  }
};
