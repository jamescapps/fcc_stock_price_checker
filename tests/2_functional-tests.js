/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

const chaiHttp = require('chai-http')
const chai = require('chai')
const assert = chai.assert
const server = require('../server')

const Stock = require('../models/new_stock.model')
const IP = require('../models/new_ip.model')

chai.use(chaiHttp)

suite('Functional Tests', function() {
  //Clear Stocks database before running tests.
  this.beforeAll((done) => {
    Stock.deleteMany({}, (err) => {
      assert.ifError(err);
      console.log('Deleted all current items in database.')
      done()
    })
  })

  //Clear IP database before running tests.
  this.beforeAll((done) => {
    IP.deleteMany({}, (err) => {
      assert.ifError(err);
      console.log('Deleted all current IPs in database.')
      done()
    })
  })
    
    suite('GET /api/stock-prices => stockData object', function() {
      
      test('1 stock', function(done) {
       chai.request(server)
        .get('/api/stock-prices')
        .query({stock: 'goog'})
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.property(res.body.stockData, 'stock')
          assert.property(res.body.stockData, 'price')
          assert.property(res.body.stockData, 'likes')
          assert.equal(res.body.stockData.stock, 'GOOG')
          done()
        })
      })
      
      test('1 stock with like', function(done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({stock: 'goog', like: true})
            .end(function(err, res){
              console.log(res.body)
              assert.equal(res.status, 200);
              assert.property(res.body.stockData, 'stock')
              assert.property(res.body.stockData, 'price')
              assert.property(res.body.stockData, 'likes')
              assert.equal(res.body.stockData.stock, 'GOOG')
              assert.isAbove(res.body.stockData.likes, 0)
              done()
            })
      })
      
      test('1 stock with like again (ensure likes arent double counted)', function(done) {
        chai.request(server)
            .get('/api/stock-prices')
            .query({stock: 'goog', like: true})
            .end(function(err, res){
              assert.equal(res.status, 200)
              assert.property(res.body.stockData, 'stock')
              assert.property(res.body.stockData, 'price')
              assert.property(res.body.stockData, 'likes')
              assert.equal(res.body.stockData.stock, 'GOOG')
              assert.equal(res.body.stockData.likes, 1)
              done()
            })
      })
      
      test('2 stocks', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','aapl']})
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.isArray(res.body.stockData)
          assert.property(res.body.stockData[0], 'stock')
          assert.property(res.body.stockData[0], 'price')
          assert.property(res.body.stockData[0], 'rel_likes')
          assert.property(res.body.stockData[1], 'stock')
          assert.property(res.body.stockData[1], 'price')
          assert.property(res.body.stockData[1], 'rel_likes')
          assert.oneOf(res.body.stockData[0].stock, ['GOOG','AAPL'])
          assert.oneOf(res.body.stockData[1].stock, ['GOOG','AAPL'])
          assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0)
          done();
        })
      })
      
      test('2 stocks with like', function(done) {
        chai.request(server)
        .get('/api/stock-prices')
        .query({stock: ['goog','AAPL'], like: true})
        .end(function(err, res){
          assert.equal(res.status, 200)
          assert.isArray(res.body.stockData)
          assert.property(res.body.stockData[0], 'stock')
          assert.property(res.body.stockData[0], 'price')
          assert.property(res.body.stockData[0], 'rel_likes')
          assert.property(res.body.stockData[1], 'stock')
          assert.property(res.body.stockData[1], 'price')
          assert.property(res.body.stockData[1], 'rel_likes')
          assert.oneOf(res.body.stockData[0].stock, ['GOOG','AAPL'])
          assert.oneOf(res.body.stockData[1].stock, ['GOOG','AAPL'])
          assert.equal(res.body.stockData[0].rel_likes + res.body.stockData[1].rel_likes, 0)
          done()
        })
      })
      
    })

})
