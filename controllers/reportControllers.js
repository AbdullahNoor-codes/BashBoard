const { sendMessageToSlack } = require("../utils");

const sendReportHandler = async (req, res) => {
  try {
    await sendMessageToSlack();
    res.status(200).json({ message: "Reports sent successfully!" });
  } catch (error) {
    console.error("Error sending reports:", error);
    res.status(500).json({ error: "Failed to send reports" });
  }
};

module.exports = { sendReportHandler };
