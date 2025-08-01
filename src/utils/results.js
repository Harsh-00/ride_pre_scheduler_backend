module.exports = (res,success, message, data, status = 200) => {
    res.status(status).json({ success, message, data });
  };