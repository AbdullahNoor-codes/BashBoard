import axios from "axios";

const sendReportToSlack = async (reportData, userEmail) => {
    try {
        const response = await axios.post('https://bashhub-apis.vercel.app/sendReportToSlack', {
            reportData,
            userEmail,
        });

        if (response.data.success) {
            console.log('Report sent successfully!');
        } else {
            console.error('Failed to send report:', response.data.error);
        }
    } catch (error) {
        console.error('Error sending report:', error);
    }
};

export default sendReportToSlack