const CNIC_PATTERN = /^\d{5}-\d{7}-\d{1}$/;

function isValidCnicFormat(cnicNumber) {
  if (!cnicNumber || typeof cnicNumber !== "string") {
    return false;
  }

  return CNIC_PATTERN.test(cnicNumber.trim());
}

module.exports = {
  isValidCnicFormat,
};
