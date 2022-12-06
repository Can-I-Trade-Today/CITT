"use strict";
const { schedule } = require("@netlify/functions");
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });

const yahooFinance = require('yahoo-finance');

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.DATABASE_UN}:${process.env.DATABASE_PW}@citt-cluster.xllgjxx.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const handler = async function (event, context) {
  console.log("Received event:", event);
  const database = client.db("StockData");
  const iwoCollection = database.collection("IWO");
  const latestIwo = await iwoCollection.find({}).sort({_id:-1}).limit(1).toArray();
  console.log(latestIwo[0]);



  // yahooFinance.historical({
  //   symbol: 'IWO',
  //   from: '2022-12-01',
  //   to: '2022-12-07',
  //   period: 'd'
  // }, async function(err, quotes) {
  //   console.log(quotes);
  //   const writeResult = await iwoCollection.insertMany(quotes);
  //   console.log(writeResult.insertedCount);
  // });

  return {
    statusCode: 200,
  };
};

module.exports.handler = schedule("@daily", handler);
