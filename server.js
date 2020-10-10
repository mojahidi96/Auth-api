require('dotenv').config()
const express = require('express');
const cors = require('cors');
const bodyparser = require('body-parser');
const mongoose = require('mongoose');
const logger = require('./logger-config');
function connectToMongo() {
  const connectionUrl = `${process.env.HOST}:${process.env.MONGO_PORT}/${process.env.DB}`;
  mongoose.connect(connectionUrl, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
    logger.info("DB Connected successfully")
  }, error => logger.error('Error on cnnection', error))
}
connectToMongo();

const app = express();
app.use(cors({ origin: ['http://localhost:4200', 'http://localhost:4201'], optionsSuccessStatus: 200 }));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({ extended: true }));
app.use('/user', require('./user-route'));

let port = process.env.PORT || 3000
app.listen(port, () => { console.log(`server is running on port ${port}`) })

