"use strict";
const express = require("express");
const path = require("path");
const serverless = require("serverless-http");
const app = express();
const bodyParser = require("body-parser");
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });

//MongoDB
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATABASE_UN}:${process.env.DATABASE_PW}@citt-cluster.xllgjxx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const router = express.Router();
router.get("/", async (req, res) => {
  res.writeHead(200, { "Content-Type": "text/html" });
  res.write("<h1>Hello from Earde and Hessel!</h1>");
  const result = await client.db("StockData").collection("IWO").find({}).sort({_id:-1}).limit(50).toArray();
  let sma50 = 0;
  for (let x of result) {
    sma50 += x.close;
  }
  sma50 /= 50.0;
  res.write(`<h1>${JSON.stringify(result)}</h1>`);
  res.write(`<h1>${sma50}</h1>`);
  res.end();
});
router.get("/another", (req, res) => res.json({ route: req.originalUrl }));
router.post("/", (req, res) => res.json({ postBody: req.body }));

app.use(bodyParser.json());
app.use("/.netlify/functions/server", router); // path must route to lambda
app.use("/", (req, res) => res.sendFile(path.join(__dirname, "../index.html")));

module.exports = app;
module.exports.handler = serverless(app);
