const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 3000;

// Replace these with your Gmail credentials or App Password
//const nodemailer = require('nodemailer');
//require('dotenv').config(); // 👈 load .env at the top

// const nodemailer = require("nodemailer");

// let transporter = nodemailer.createTransport({
//   host: "smtp.your-email-provider.com",  // e.g., smtp.gmail.com
//   port: 587,
//   secure: false, // true for port 465, false for 587
//   auth: {
//     user: "asmartcity160@gmail.com",      // ✔️ Your email address
//     pass: "btvbzjimbyahfzac", // ✔️ Your password or app-specific password
//   },
// });


// // Email options
// const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: 'nagamallika816.com', // 👈 change to receiver email
//     subject: 'Hello from Nodemailer!',
//     text: 'This is a test email sent using Nodemailer with Gmail App Password.'
// };

// // Send email
// transporter.sendMail(mailOptions, function(error, info){
//     if (error) {
//         console.log('❌ Error sending mail:', error);
//     } else {
//         console.log('✅ Email sent successfully: ' + info.response);
//     }
// });




// // API endpoint to send email
// app.post('/send-alert', (req, res) => {
//     const { area, usage, threshold } = req.body;

//     const mailOptions = {
//         from: '"Smart City Dashboard" <asmartcity160@gmail.com>',
//         to: 'admin@smartcity.com', // Admin email
//         subject: `🚨 Power Alert: ${area} exceeded threshold`,
//         text: `Alert!\n\n${area} has consumed ${usage} kWh which exceeds the threshold of ${threshold} kWh.\n\nPlease take necessary action.`
//     };

//     transporter.sendMail(mailOptions, (error, info) => {
//         if (error) {
//             console.error('❌ Error sending mail:', error);
//             return res.status(500).send('Error sending mail');
//         }
//         console.log('✅ Email sent:', info.response);
//         res.status(200).send('Alert email sent successfully');
//     });
// });

// Start server
app.listen(PORT, () => {
    console.log(`✅ Server running on http://localhost:${PORT}`);
});
