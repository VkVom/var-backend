const express = require('express');
const cors = require('cors');
require('dotenv').config();
const SibApiV3Sdk = require('@sendinblue/client');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "https://var-frontend.vercel.app", // IMPORTANT: This must match your Vercel URL
  methods: ["GET", "POST"],
}));
app.use(express.json());

// --- Brevo (Sendinblue) API Client Setup ---
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
const apiKey = apiInstance.authentications['apiKey'];
apiKey.apiKey = process.env.BREVO_API_KEY;

// --- API Route for Sending Emails ---
app.post('/api/send', async (req, res) => {
  const { name, email, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ status: 'fail', message: 'All fields are required.' });
  }

  const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

  sendSmtpEmail.subject = `New Contact Form Submission from ${name}`;
  sendSmtpEmail.htmlContent = `
    <h2>New Portfolio Contact</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Message:</strong></p>
    <p>${message.replace(/\n/g, '<br>')}</p>
  `;
  sendSmtpEmail.sender = { name: 'VAR Portfolio Form', email: process.env.FROM_EMAIL };
  sendSmtpEmail.to = [{ email: process.env.TO_EMAIL }];

  try {
    const data = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log('API called successfully. Returned data: ' + JSON.stringify(data));
    res.status(200).json({ status: 'success', message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ status: 'error', message: 'Something went wrong. Please try again.' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});