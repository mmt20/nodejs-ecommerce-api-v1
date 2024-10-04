// Modemailer
const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) create transporter (service that will send email like "gmail", "Mailgun", "mialtrap", sendGrid)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT, // if  secure post is false = 587 , if true post = 465
    secure: true,
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
  console.log(process.env.EMAIL_USER);
  console.log(process.env.EMAIL_PASS);
  // 2) Define email options (like from, to , subject , content)
  const mailOPtions = {
    from: 'E-Shop App mostafadevtest@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  // 3) send email
  await transporter.sendMail(mailOPtions);
};

module.exports = sendEmail;
