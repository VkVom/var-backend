const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
// Enable CORS for all routes to allow requests from your React frontend


app.use(cors({
  origin: "https://var-contact-us.vercel.app", // your Vercel frontend URL
  methods: ["GET","POST","PUT","DELETE"],
  credentials: true
}));

// Parse incoming JSON requests
app.use(express.json());

// --- Nodemailer Transporter Setup ---
// This transporter is how your server connects to your Gmail account to send emails.
// It uses the credentials you'll set in the .env file.
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS, // Your 16-character App Password
  },
});

// Verify the transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error with Nodemailer transporter config:', error);
  } else {
    console.log('Nodemailer is configured and ready to send emails.');
  }
});


// --- API Route for Sending Emails ---
app.post('/api/send', (req, res) => {
  const { name, email, message } = req.body;

  // Basic validation
  if (!name || !email || !message) {
    return res.status(400).json({ status: 'fail', message: 'All fields are required.' });
  }

  // Email content setup
  const mailOptions = {
    from: `"${name}" <${email}>`, // Shows sender's name and email
    to: process.env.EMAIL_USER,    // The email address that will receive the form data
    subject: `New Contact Form Submission from ${name}`,
    html: `
      <h2>New Portfolio Contact</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
    `,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
      return res.status(500).json({ status: 'error', message: 'Something went wrong. Please try again.' });
    }
    console.log('Email sent: ' + info.response);
    res.status(200).json({ status: 'success', message: 'Your message has been sent successfully!' });
  });
});


// Start the server
app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
