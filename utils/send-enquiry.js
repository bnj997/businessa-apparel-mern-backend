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
  let transporter = nodemailer.createTransport({
    host: "mail.businessapparel.com.au",
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.USER_EMAIL, // generated ethereal user
      pass: process.env.USER_PASSWORD, // generated ethereal password
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  
  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: email, // sender address
    to: 'bnj997@gmail.com', // list of receivers
    subject: `New Enquiry from ${name}`, // Subject line
    html: output, // html body
  });

  console.log("Message sent: %s", info.messageId);
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}

module.exports = sendEnquiryForm;
