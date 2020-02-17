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

//I think it works.
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
      var ipWasFound

      

      console.log(ipAddress)
      //Check that ip has not all ready been used if like is clicked
      if (like) {
        IP.find({ip: ipAddress}, (err, result) => {
          console.log(result)
          if (err) {
            console.log('error')
          }else if (result.length < 1) {
            console.log('Ip has not been used')
            ipWasFound = false
            let newIP = new IP ({ip: ipAddress})
            newIP.save()
              .then(() => console.log('ip saved'))
              .catch((err => console.log(err)))
  
          } else {
            console.log('ip has been used')
            ipWasFound = true
            //likeCount = 0
           // console.log(likeCount)
          }
         // console.log(likeCount)
         // console.log(ipWasFound)
        })
      }
      

      
     // console.log(likeCount)
        //console.log(ipWasFound)
        if (ipWasFound) {
          !like
        } else if (like) {
          likeCount = 1
        } else {
          likeCount = 0
        }
        /*if (like && !ipWasFound) {
          likeCount = 1
        } else {
          likeCount = 0
        }*/
      

      //One stock.
      if (typeof stock === 'string') {
        fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stock}/quote`)
        .then((res) => { return res.json()})
        .then((data) => {
          if (data === 'Unknown symbol') {
            res.send('Unknoen stock symbol')
            return
          } else {
            stockData.stock = data.symbol
            stockData.price = data.latestPrice.toString()
            stockData.likes = likeCount
            //Check for likes and save stock if not in database.
            Stock.find({stock: data.symbol}, (err, result) => {
              if (result.length < 1 && !ipWasFound) {
                let newStock = new Stock ({
                  stock: data.symbol,
                  likes: likeCount
                })
                newStock.save()
                  //.then(() => console.log('saved'))
                  .catch((err => console.log(err)))
                res.json({stockData:stockData})
              } else if (result.length < 1 && ipWasFound) {
                let newStock = new Stock ({
                  stock:data.symbol,
                  likes: 0
                })
                newStock.save()
                .catch((err => console.log(err)))
                stockData.likes = 0
                res.json({stockData:stockData})
              } else if (err) {
                res.send(err)
                //No result found
              } else {
                //Stock exists in database and like was clicked and ipaddress has not previously liked.
                if (like && !ipWasFound) {
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
        let stockDataTwo = {}
        let stockData = []

        if (ipWasFound) {
          !like
        } else if (like) {
          likeCount = 1
        } else {
          likeCount = 0
        }
        

        //Case for stock 1 is not in database and stock 2 is.
        //Case for stock 1 is in database and stock 2 is not
        //Case for both not being in database.
        //case for neither in database

        //Get stock 1
        fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stockOne}/quote`)
          .then((res) => { return res.json()})
          .then((data) => {
           // stockData[0].push(data.symbol)
            //stockData[0].push(data.latestPrice.toString())
            stockDataOne.stock = data.symbol
            stockDataOne.price = data.latestPrice.toString()
           // console.log(stockDataOne)
           // stockDataOne.like = likeCount
            //Check if stock is in database and existing like and increment if like is currently checked
            Stock.find({stock: data.symbol}, (err, result) => {
              if (result < 1 && !ipWasFound) {
                let newStock = new Stock ({
                  stock: data.symbol,
                  likes: 1
                })
                newStock.save()
                  //.then(() => console.log('saved'))
                  .catch((err => console.log(err)))
                  stockDataOne.likes = 1
              } else if(result < 1 && ipWasFound) {
                let newStock = new Stock ({
                  stock: data.symbol,
                  likes: 0
                })
                newStock.save()
                //.then(() => console.log('saved'))
                .catch((err => console.log(err)))
                stockDataOne.likes = 0
               // console.log(stockDataOne)
              } else {
                //Stock exists in database and like was clicked and ipaddress has not previously liked.
                if (like && !ipWasFound) {
                  Stock.findByIdAndUpdate({_id: result[0]._id}, {$inc:{likes: 1}}, (err, response) => {
                    if (err) {
                      res.send(err)
                    } else {
                      stockDataOne.likes = response.likes + 1
                    }
                  })
                  //Stock exists and like was not clicked
                } else {
                  stockDataOne.likes = result[0].likes
                  //console.log(stockDataOne)
                }
                
              }
            stockData.push(stockDataOne)
            //console.log(stockData)
           // stockData.push("stock2")
          //  console.log(stockData)
            //insert stock 2 here


            //Get stock 2 price
            fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stockTwo}/quote`)
            .then((res) => { return res.json()})
            .then((data) => {
              stockDataTwo.stock = data.symbol
              stockDataTwo.price = data.latestPrice.toString()
            //  stockDataTwo.likes = likeCount

              Stock.find({stock: data.symbol}, (err, result) => {
                if (result < 1 && !ipWasFound) {
                  let newStock = new Stock ({
                    stock: data.symbol,
                    likes: 1
                  })
                  newStock.save()
                  //.then(() => console.log('saved'))
                  .catch((err => console.log(err)))
                  stockDataTwo.likes = 1
                } else if(result < 1 && ipWasFound) {
                  let newStock = new Stock ({
                    stock: data.symbol,
                    likes: 0
                  })
                  newStock.save()
                  //.then(() => console.log('saved'))
                  .catch((err => console.log(err)))
                  stockDataTwo.likes = 0
                 // console.log(stockDataOne)
                } else {
                  //Stock exists in database and like was clicked and ipaddress has not previously liked.
                  if (like && !ipWasFound) {
                    Stock.findByIdAndUpdate({_id: result[0]._id}, {$inc:{likes: 1}}, (err, response) => {
                      if (err) {
                        res.send(err)
                      } else {
                        stockDataTwo.likes = response.likes + 1
                      }
                    })
                    //Stock exists and like was not clicked
                  } else {
                    stockDataTwo.likes = result[0].likes
                    //console.log(stockDataOne)
                  }
                }
                stockData.push(stockDataTwo)
              // console.log(stockData)
                let maxLikes = Math.max(stockDataOne.likes, stockDataTwo.likes)
                let minLikes = Math.min(stockDataOne.likes, stockDataTwo.likes)
                console.log(stockDataOne)
                let rel_likes = (maxLikes - minLikes)
                stockDataOne.rel_likes = rel_likes
                stockDataTwo.rel_likes = rel_likes
                stockDataOne.likes = undefined
                stockDataTwo.likes = undefined
              
               console.log(rel_likes)
          
                res.send(stockData)
              })
            })



            })
          
          })
          
      }
      
    });
    
};
