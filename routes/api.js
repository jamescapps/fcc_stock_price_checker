/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';


const fetch = require('node-fetch')

const IP = require('../models/new_ip.model')
const Stock = require('../models/new_stock.model')

const mongoose = require('mongoose')

//mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
mongoose.connect('mongodb://localhost/stocks', { useUnifiedTopology: true, useNewUrlParser: true }) 

//Test connection
mongoose.connection.once('open', () => {
  console.log("Connected to database!")
})

//Need to do relative likes and only allow one like per ip address.

module.exports = function (app) {

//Need to only allow one like for ip
  app.route('/api/stock-prices')
    .get((req, res) => {
      let stockData = {}
      let stock = req.query.stock
      var like = req.query.like || false
      var likeCount
      //Only allow 1 like per ip
      let ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim()

      if (like) {
        likeCount = 1
      } else {
        likeCount = 0
      }
      //One stock.
      if (typeof stock === 'string') {
        fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`)
        .then((res) => { return res.json()})
        .then((data) => {
          if (data === 'Unknown symbol') {
            res.send('Unknown stock symbol')
            return
          } else {
            stockData.stock = data.symbol
            stockData.price = data.latestPrice.toString()
            stockData.likes = likeCount
            //Check for likes and save stock if not in database.
            Stock.find({stock: data.symbol}, (err, result) => {
              if (result.length < 1) {
                let newStock = new Stock ({
                  stock: data.symbol,
                  likes: likeCount
                })
                newStock.save()
                  //.then(() => console.log('saved'))
                  .catch((err => console.log(err)))
                res.json({stockData:stockData})
              } else if (err) {
                res.send(err)
              } else {
                //Stock exists in database and like was clicked.
                if (like) {
                  Stock.findByIdAndUpdate({_id: result[0]._id}, {$inc:{likes: 1}}, (err, response) => {
                    if (err) {
                      res.send(err)
                    } else {
                      stockData.likes = response.likes + 1
                      res.json({stockData:stockData})
                    }
                  })
                  //Stock exists and like was not clicked
                } else {
                  stockData.likes = result[0].likes
                  res.json({stockData:stockData})
                }
              }
            })
          }
          
        })
        .catch((error) => {
          res.send(error)
        }) 
      }

      if (Array.isArray(stock)) {
        let stockOne = stock[0]
        let stockTwo = stock[1]
        let stockDataOne = {}
        let stockDataTwo = []
        let stockData = []

        if (like) {
          likeCount = 1
        } else {
          likeCount = 0
        }
        

        //Case for stock 1 is not in database and stock 2 is.
        //Case for stock 1 is in database and stock 2 is not
        //Case for both not being in database.
        //case for neither in database
        
        //Need in case one of the stocks are not found (invalid stock)
        //Get stock 1 price
        fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stockOne}/quote`)
          .then((res) => { return res.json()})
          .then((data) => {
           // stockData[0].push(data.symbol)
            //stockData[0].push(data.latestPrice.toString())
            stockDataOne.stock = data.symbol
            stockDataOne.price = data.latestPrice.toString()
            stockDataOne.like = likeCount
            //Check if stock is in database and existing like and increment if like is currently checked
            Stock.find({stock: data.symbol}, (err, result) => {
              if (result < 1) {
                let newStock = new Stock ({
                  stock: data.symbol,
                  likes: likeCount
                })
                newStock.save()
                  //.then(() => console.log('saved'))
                  .catch((err => console.log(err)))
              }
            })
            //Get stock 2 price
            fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stockTwo}/quote`)
            .then((res) => { return res.json()})
            .then((data) => {
              stockDataTwo.stock = data.symbol
              stockDataTwo.price = data.latestPrice.toString()
              stockDataTwo.likes = likeCount
                
              //stockData[1].push(data.symbol)
              //stockData[1].push(data.latestPrice.toString())
              //Check if stock is in database and existing like and increment if like is currently checked
              Stock.find({stock: data.symbol}, (err, result) => {
                if (result < 1) {
                  let newStock = new Stock ({
                    stock: data.symbol,
                    likes: likeCount
                  })
                  newStock.save()
                    .catch((err => console.log(err)))
                }
                //console.log(stockDataOne)
                //console.log(stockDataTwo)
                stockData.push(stockDataOne)
                stockData.push(stockDataTwo)
                res.json({stockData:stockData})
              })
              
            })
          .catch((error) => {
            res.send('error')
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
