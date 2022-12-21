"use strict";
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });

//MongoDB
const mongoose = require('mongoose');
const databaseName = 'test';
const uri = `mongodb://${process.env.DATABASE_UN}:${process.env.DATABASE_PW}@ac-xtrksdk-shard-00-00.xllgjxx.mongodb.net:27017,ac-xtrksdk-shard-00-01.xllgjxx.mongodb.net:27017,ac-xtrksdk-shard-00-02.xllgjxx.mongodb.net:27017/${databaseName}?ssl=true&replicaSet=atlas-7yqlx5-shard-0&authSource=admin&retryWrites=true&w=majority`;
mongoose.connect(uri);
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
  console.log("Connection Successful!");
});

var candlestickSchema = mongoose.Schema({
  date: Date,
  high: Number,
  low: Number,
  open: Number,
  close: Number,
  adjClose: Number,
  volume: Number,
  symbol: String
});

var candlestick = mongoose.model('Candlestick', candlestickSchema, 'IWO');

console.log('Initializing express router.');
const router = express.Router();
router.get("/", async (req, res) => {
  console.log('Endpoint / called.');
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Earde and Hessel!</h1>");
  const result = await candlestick.find({}).sort({_id:-1}).limit(50).exec();
  let sma50 = 0;
  if (result.length > 0) {
    for (let x of result) {
      sma50 += x.close;
    }
    sma50 /= result.length;
  }
  res.write(`<h1>${JSON.stringify(result)}</h1>`);
  res.write(`<h1>${sma50}</h1>`);
  res.end();
});
router.get("/another", (req, res) => res.json({ route: req.originalUrl }));
router.post("/", (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use("/.netlify/functions/server", router); // path must route to lambda
app.use("/", (req, res) => res.sendFile("index.html", {root: './'}));

module.exports = {
  app: app,
  mongoose: mongoose
}
// module.exports = app;
module.exports.handler = serverless(app);
