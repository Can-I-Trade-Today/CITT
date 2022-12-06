"use strict";
const { schedule } = require("@netlify/functions");
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATABASE_UN}:${process.env.DATABASE_PW}@citt-cluster.xllgjxx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const handler = async function (event, context) {
  console.log("Received event:", event);

  const result = await client.db("StockData").collection("IWO").find({}).limit(50).toArray();

  return {
    statusCode: 200,
  };
};

module.exports.handler = schedule("@hourly", handler);
