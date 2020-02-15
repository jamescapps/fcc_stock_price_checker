/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb');
const StockHandler = require('../controllers/stockHandler')
const fetch = require('node-fetch')

const CONNECTION_STRING = process.env.DB; //MongoClient.connect(CONNECTION_STRING, function(err, db) {});

module.exports = function (app) {
  //var stockPrices = new StockHandler();


  app.route('/api/stock-prices')
    .get((req, res) => {
      let stockData ={}
      let stock = req.query.stock
      let like = req.query.like || false
      //Only allow 1 like per ip
      let ip = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim()

      console.log(like)
      if (typeof stock === 'string') {
        //Need to return {stock: '', price: (decimal in string format), likes: (int)}
        fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`)
        .then((u) => { return u.json()})
        .then((data) => {
          stockData.stock = data.symbol
          stockData.price = data.latestPrice.toString()
          res.json({stockData: stockData})
        })
        .catch((error) => {
          res.send(error)
        }) 
      }

      if (Array.isArray(stock)) {
        let stockOne = stock[0]
        let stockTwo = stock[1]
        let stockData = []

        //Get stock 1 price
        fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stockOne}/quote`)
          .then((res) => { return res.json()})
          .then((data) => {
            stockData.push(data.symbol)
            stockData.push(data.latestPrice.toString())

            //Get stock 2 price
            fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stockTwo}/quote`)
            .then((res) => { return res.json()})
            .then((data) => {
              stockData.push(data.symbol)
              stockData.push(data.latestPrice.toString())
                res.json({stockData:[{stock:stockData[0],price:stockData[1]},{stock:stockData[2],price:stockData[3]}]})
            })
          .catch((error) => {
            res.send(error)
          }) 
          })
          .catch((error) => {
            res.send(error)
          }) 
      }
      
      //Handle likes
        //Only one like per ip address.
        //Find out if stock has any likes in the database.
          //If it does return those likes as well as the new one, if applicable.
        //2 Stocks the likes value disapears and we will see rel_likes (difference of likes between two, on both.)
    });
    
};
