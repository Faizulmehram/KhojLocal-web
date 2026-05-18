// CNIC verification disabled — always return non-blocking success so frontend remains informational only
async function verifyCnicController(req, res) {
  // If no file provided, return success but indicate nothing extracted.
  return res.status(200).json({ verified: true, data: {} });
}

module.exports = {
  verifyCnicController,
};
