require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const HttpError = require('./models/http-error');

const branchesRoutes = require('./routes/branches-routes');
const garmentsRoutes = require('./routes/garments-routes');
const hqsRoutes = require('./routes/hqs-routes');
const usersRoutes = require('./routes/users-routes');
const orderLinesRoutes = require('./routes/order-lines-routes');
const ordersRoutes = require('./routes/orders-routes');


const app = express();

app.use(bodyParser.json())


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/branches', branchesRoutes);
app.use('/api/garments', garmentsRoutes);
app.use('/api/hqs', hqsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/order-lines', orderLinesRoutes);



app.use((req, res, next) => {
  const error = new HttpError('Could not find this route.', 404);
  throw error;
});


const NAME = process.env.NAME;
const PASSWORD = process.env.PASSWORD;
mongoose
  .connect(
    `mongodb+srv://${NAME}:${PASSWORD}@business-apparel.fccf2.mongodb.net/business_apparel?retryWrites=true&w=majority`, { useUnifiedTopology: true, useNewUrlParser: true}
  )
  .then(() => {
    app.listen(5000);
  })
  .catch(err => {
    console.log(err);
  });

