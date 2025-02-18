// Utility to handle responses
exports.success = (res, message, data) => {
  res.status(200).json({ success: true, message, data });
};

exports.error = (res, message) => {
  res.status(400).json({ success: false, message });
};

exports.unauthorized = (res, message) => {
  res.status(401).json({ success: false, message });
};

exports.forbidden = (res, message) => {
  res.status(403).json({ success: false, message });
};

exports.notFound = (res, message = "Resource not found") => {
  res.status(404).json({ success: false, message });
};

exports.serverError = (res, message = "Internal server error") => {
  res.status(500).json({ success: false, message });
};

exports.methodNotAllowed = (res, message = "Http Method not allowed") => {
  res.status(405).json({ success: false, message });
};
