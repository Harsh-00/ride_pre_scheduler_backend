const { ApiError } = require('../utils/errors');
const sendResult = require('../utils/results');

module.exports = (err, req, res, next) => {
  if (err instanceof ApiError) {
    return sendResult(res, false, err.message, {error:err}, err.statusCode) 
  }
  console.error(err);
  return sendResult(res, false, "Internal Server Error", {error:err}, 500)  
};