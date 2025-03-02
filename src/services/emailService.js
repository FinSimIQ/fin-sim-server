const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const { OAuth2 } = google.auth;

const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

const FROM_EMAIL = "finsimiq@gmail.com"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: FROM_EMAIL,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: async () => {
        const accessToken = await oauth2Client.getAccessToken();
        return accessToken.token; 
      }
    }
  });
  
  // Function to send email
  const sendEmail = async (to, subject, htmlContent) => {
    const mailOptions = {
      from: FROM_EMAIL,
      to: to,
      subject: subject,
      html: htmlContent
    };
  
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent: ', info.response);
    } catch (error) {
      console.error('Error sending email:', error);
    }
  };

  module.exports = { sendEmail };