const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Nodemailer configuration
const transporter = nodemailer.createTransport({
    service: 'gmail', // Use your email service (e.g., Gmail, Outlook)
    auth: {
        user: 'your-email@gmail.com', // Replace with your email
        pass: 'your-email-password', // Replace with your email password or app-specific password
    },
});

// Email endpoint
app.post('/send-email', (req, res) => {
    const { name, email, message } = req.body;

    const mailOptions = {
        from: 'your-email@gmail.com', // Sender email
        to: 'your-email@gmail.com', // Receiver email (can be the same or different)
        subject: 'New Contact Form Submission', // Email subject
        text: `Name: ${name}\nEmail: ${email}\nMessage: ${message}`, // Email body
    };

    // Send email
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error('Error sending email:', error);
            return res.status(500).send(error.toString());
        }
        console.log('Email sent:', info.response);
        res.status(200).send('Email sent successfully!');
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
}); 