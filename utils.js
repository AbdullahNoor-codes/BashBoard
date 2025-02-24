const axios = require("axios");

const sendMessageToSlack = async () => {
  try {
    const response = await axios.post(
      "https://slack.com/api/chat.postMessage",
      {
        channel: process.env.SLACK_CHANNEL_ID,
        text: "test",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.SLACK_BOT_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.data.ok) {
      console.error("Error sending message to Slack:", response.data.error);
    } else {
      console.log("Message sent successfully to Slack.");
    }
  } catch (error) {
    console.error("Error sending message to Slack:", error.message);
  }
};

module.exports = { sendMessageToSlack };
