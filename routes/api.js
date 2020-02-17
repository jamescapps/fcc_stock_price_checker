/*
*
*
*       Complete the API routing below
*
*
*/

'use strict'


const fetch = require('node-fetch')

const IP = require('../models/new_ip.model')
const Stock = require('../models/new_stock.model')

const mongoose = require('mongoose')

mongoose.connect(process.env.MONGODB_URI, { useUnifiedTopology: true, useNewUrlParser: true })
//mongoose.connect('mongodb://localhost/stocks', { useUnifiedTopology: true, useNewUrlParser: true }) 

//Test connection
mongoose.connection.once('open', () => {
  console.log("Connected to database!")
})


module.exports = (app) => {

  app.route('/api/stock-prices')
    .get((req, res) => {
      let stockData = {}
      let stock = req.query.stock
      let like = req.query.like || false
      let likeCount
      let ipAddress = (req.headers['x-forwarded-for'] || req.connection.remoteAddress || '').split(',')[0].trim()
      let ipWasFound

      //Check that ip has not all ready been used if like is clicked
      if (like) {
        IP.find({ip: ipAddress}, (err, result) => {
          if (err) {
            console.log('error')
          }else if (result.length < 1) {
            ipWasFound = false
            let newIP = new IP ({ip: ipAddress})
            newIP.save()
              .catch((err => console.log(err)))
          } else {
            ipWasFound = true
          }
        })
      }
      
      if (ipWasFound) {
          !like
        } else if (like) {
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

      //Two stocks
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

        //Get stock 1
        fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stockOne}/quote`)
          .then((res) => { return res.json()})
          .then((data) => {
            stockDataOne.stock = data.symbol
            stockDataOne.price = data.latestPrice.toString()

            //Check if stock is in database 
            Stock.find({stock: data.symbol}, (err, result) => {
              if (result < 1 && !ipWasFound) {
                let newStock = new Stock ({
                  stock: data.symbol,
                  likes: 1
                })
                newStock.save()
                  .catch((err => console.log(err)))
                  stockDataOne.likes = 1
              } else if(result < 1 && ipWasFound) {
                let newStock = new Stock ({
                  stock: data.symbol,
                  likes: 0
                })
                newStock.save()
                .catch((err => console.log(err)))
                stockDataOne.likes = 0
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
                }
              }
            stockData.push(stockDataOne)


            //Get stock 2 price
            fetch(`https://repeated-alpaca.glitch.me/v1/stock/${stockTwo}/quote`)
              .then((res) => { return res.json()})
              .then((data) => {
                stockDataTwo.stock = data.symbol
                stockDataTwo.price = data.latestPrice.toString()
          
              //Check if stock exists in database
              Stock.find({stock: data.symbol}, (err, result) => {
                if (result < 1 && !ipWasFound) {
                  let newStock = new Stock ({
                    stock: data.symbol,
                    likes: 1
                  })
                  newStock.save()
                    .catch((err => console.log(err)))

                  stockDataTwo.likes = 1
                } else if(result < 1 && ipWasFound) {
                  let newStock = new Stock ({
                    stock: data.symbol,
                    likes: 0
                  })
                  newStock.save()
                    .catch((err => console.log(err)))

                  stockDataTwo.likes = 0
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
                  }
                }
                stockData.push(stockDataTwo)
           
                //Set relative likes.
                let maxLikes = Math.max(stockDataOne.likes, stockDataTwo.likes)
                let minLikes = Math.min(stockDataOne.likes, stockDataTwo.likes)
                let rel_likes = (maxLikes - minLikes)

                if (maxLikes = stockDataOne.likes) {
                  stockDataOne.rel_likes = rel_likes
                  stockDataTwo.rel_likes = (rel_likes) * -1
                }

                if (maxLikes = stockDataTwo.likes) {
                  stockDataOne.rel_likes = (rel_likes) * -1
                  stockDataTwo.rel_likes = (rel_likes)
                }
                
                stockDataOne.likes = undefined
                stockDataTwo.likes = undefined
          
                //Send final result.
                res.json({stockData:stockData})
              })
              })
            })
          })
      }
    })
    
}
