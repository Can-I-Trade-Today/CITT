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
  const latestDate = latestIwo[0].date;
  const todayDate = new Date();
  const from = latestDate.toISOString('yyyy-mm-dd').split('T')[0];
  const to = todayDate.toISOString('yyyy-mm-dd').split('T')[0];
  console.log(from);

  yahooFinance.historical({
    symbol: 'IWO',
    from: from,
    to: to,
    period: 'd'
  }, async function(err, quotes) {
    quotes.reverse();
    quotes = quotes.filter(item => !(item.date <= latestDate))
    console.log(quotes);
    if (quotes.length > 0) {
      const writeResult = await iwoCollection.insertMany(quotes);
      console.log(writeResult.insertedCount);
    }
  });

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*"
    }
  };
};

module.exports.handler = schedule("@daily", handler);
