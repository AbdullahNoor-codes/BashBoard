const express = require("express");
const { sendReportHandler } = require("../controllers/reportControllers");

const router = express.Router();

// Task routes
router.get("/send", sendReportHandler);

module.exports = router;
