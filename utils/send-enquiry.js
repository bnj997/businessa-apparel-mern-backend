"use strict";
const nodemailer = require("nodemailer");
const { getMaxListeners } = require("../models/hq");
require('dotenv').config();

// async..await is not allowed in global scope, must use a wrapper
const sendEnquiryForm = async (name, email, organisation, message) => {
  const output = `
    <br></br>
    <h3>Name: ${name}</h3>
    <h3>Organisation: ${organisation}  </h3>
    <h3>Message:</h3>
    <p>Message: ${message}</p>
    <br></br>
  `;
  //create reusable transporter object using the default SMTP transport
  // let transporter = nodemailer.createTransport({
  //   host: "mail.businessapparel.com.au",
  //   port: 465,
  //   secure: true, // true for 465, false for other ports
  //   auth: {
  //     user: process.env.USER_EMAIL, // generated ethereal user
  //     pass: process.env.USER_PASSWORD, // generated ethereal password
  //   },
  //   tls: {
  //     rejectUnauthorized: false
  //   }
  // });

  let transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: 'bmqrboazqb6f3xui@ethereal.email', // generated ethereal user
      pass: 'K2VB9CKsPYbAdErmCY', // generated ethereal password
    },
  });


  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: 'noreply@gmail', // sender address
    to: 'info@businessapparel.com.au', // list of receivers
    subject: `New Enquiry from ${name}`, // Subject line
    html: output, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

module.exports = sendEnquiryForm;
