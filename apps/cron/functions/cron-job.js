"use strict";
const { schedule } = require("@netlify/functions");
const dotenv = require('dotenv');
dotenv.config({ path: '../../.env' });

const yahooFinance = require('yahoo-finance');

const mongoose = require('mongoose');
const databaseName = 'StockData';
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

const handler = async function (event, context) {
  const latestIwo = await candlestick.find({}).sort({_id:-1}).limit(1).exec();
  var from = '2000-01-01';
  var latestDate = undefined;
  if (latestIwo.length > 0) {
    latestDate = new Date(latestIwo[0].date);
    from = latestDate.toISOString('yyyy-mm-dd').split('T')[0];
  }
  const todayDate = new Date();
  const to = todayDate.toISOString('yyyy-mm-dd').split('T')[0];
  console.log('Getting yahoo data');
  console.log('From: ' + from);
  console.log('To: ' + to);

  yahooFinance.historical({
    symbol: 'IWO',
    from: from,
    to: to,
    period: 'd'
  }, async function(err, quotes) {
    quotes.reverse();
    if (latestDate) {
      quotes = quotes.filter(item => !(item.date <= latestDate));
    }
    let candlesticks = [];
    for (let q of quotes) {
      candlesticks.push(candlestick(q));
    }
    if (candlesticks.length > 0 ) {
      candlestick.insertMany(candlesticks).then((docs) => {
        console.log('Inserted items count: ' + docs.length);
      }).catch((err) => {
        console.log(err);
      });
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
