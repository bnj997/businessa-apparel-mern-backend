"use strict";
const nodemailer = require("nodemailer");
require('dotenv').config();

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (from, to, order, cart, address) => {
  // Generate test SMTP service account from ethereal.email
  // Only needed if you don't have a real mail account for testing
  let testAccount = await nodemailer.createTestAccount();
  console.log('testAccount', testAccount)

  let totalPrice = 0.00
  for (var i = 0; i < cart.length; i++) {
    totalPrice = totalPrice + cart[i].subtotal;
  }

  const output = `
    <br></br>
    <h3>Client ${order.user.username}</h3>
    <p>HQ: ${order.hq}  </p>
    <p>Branch: ${order.branch}  </p>
    <br></br>
    <h3>Order Date: ${order.date}</h3>
    <br></br>
    <table align="left">
      <tr>
        <th style="padding: 10px; text-align: left">Name</th>
        <th style="padding: 10px; text-align: left">Colour</th>
        <th style="padding: 10px; text-align: left">Size</th>
        <th style="padding: 10px; text-align: left">Price</th>
        <th style="padding: 10px; text-align: left">Qty</th>
        <th style="padding: 10px; text-align: left">Subtotal</th>
      </tr>
      ${cart.map(line => (
        `<tr>
          <td style="padding: 10px">${line.name}</td>
          <td style="padding: 10px">${line.colour}</td>
          <td style="padding: 10px">${line.size}</td>
          <td style="padding: 10px">$${line.price.toFixed(2)}</td>
          <td style="padding: 10px">${line.quantity}</td>
          <td style="padding: 10px">$${line.subtotal.toFixed(2)}</td>
        </tr>`
      ))}
      <tr>
        <th style="padding: 10px; font-weight: bold; text-align: left">Subtotal: </th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px; font-weight: bold">$${totalPrice.toFixed(2)}</th>
      </tr>
      <tr>
        <th style="padding: 10px; font-weight: bold; text-align: left">GST: </th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px; font-weight: bold">$${(totalPrice * 0.1).toFixed(2)}</th>
      </tr>
      <tr>
        <th style="padding: 10px; font-weight: bold; text-align: left">Total Cost: </th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px"></th>
        <th style="padding: 10px; font-weight: bold">$${((totalPrice * 0.1) + totalPrice).toFixed(2)}</th>
      </tr>
    </table>
    <br></br>
    <h3>Order Message: </h3>
    <p>${order.info}</p>
    <br></br>
    <h3>Shipping Details </h3>
    <p>${address}</p>
  `;

  // create reusable transporter object using the default SMTP transport
  // let transporter = nodemailer.createTransport({
  //   host: "mail.businessapparel.com.au",
  //   port: 465,
  //   secure: true, // true for 465, false for other ports
  //   auth: {
  //     user: process.env.USER_EMAIL, // generated ethereal user
  //     pass: process.env.USER_PASSWORD, // generated ethereal password
  //   },
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
    from: from, // sender address
    to: to, // list of receivers
    subject: `Order Received from ${order.user.username}`, // Subject line
    html: output, // html body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}

module.exports = sendEmail;
