const express   = require('express'),
      router    = express.Router(),
      mongoose  = require('mongoose'),
      orders    = mongoose.model('Order'),
      validator = require('./../validator/validator');

module.exports = function(app) {
  app.use('/orders', router);
};

router.get('/', function(req, res, next){ 
  let page  = validator.checkIntNumber(req.query.page);
  let count = validator.checkIntNumber(req.query.count);
  page  = (typeof(page)   != 'undefined') ? page : 0;
  count = (typeof(count)  != 'undefined') ? count : 20;
  const id = "59f634f54929021fa8251644";
  orders.getOrders(id, page, count, function(err, orders){
    if (err) {
      if (err.kind == 'ObjectId')
        res.status(400).send({status : 'Error', message : 'Bad request : Invalid ID'});
      else if (err == 'user ID is undefined')
        res.status(400).send({status : 'Error', message : 'Bad request : '+err});
      else 
        res.status(400).send({status : 'Error', message : err});
    } else {
      if (orders) {
        res.status(200).send(orders);
      } else {
        res.status(404).send({status : 'Error', message : 'Not found orders'});
      }
    }
  });
});

router.get('/:id', function(req, res, next) {
  const id = req.params.id;
  if (!id || typeof(id) == 'undefined' || id.length == 0) {
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid ID'});
  } else {
    orders.getOrder(id, function(err, order){
      if (err) {
        if (err.kind == 'ObjectId')
          res.status(400).send({status : 'Error', message : 'Bad request : Invalid ID'});
        else 
          res.status(400).send({status : 'Error', message : err});
      } else {
        if (order){
          res.status(200).send(order);
        } else {
          res.status(404).send({status:'Error', message : "Order isn't found"});
        }
      }
    });
  }
});

router.put('/confirm_order/:id', function(req, res, next){
  const id = req.params.id;
  if (!id || id.length == 0 || typeof(id) == 'undefined'){
    res.status(400).send({status:'Error',message:'Bad request'});
  } else {
    orders.setWaitStatus(id, function(err, result){
      if (err) {
        if (err.kind == "ObjectId")
          res.status(400).send({status : 'Error', message : 'Bad request: bad ID'});
        else if (err == "Status don't right")
          res.status(400).send({status : 'Error', message : err});
        else 
          res.status(400).send({status : 'Error', message : err});
      }
      else {
        if (result) {
          res.status(200).send({status : 'Change status succesfully', message : result});
        } else {
          res.status(404).send({status : 'Error', message : 'Not found order'});
        }
      }
    });
  }
});

router.post('/paid_order/:id', function(req, res, next){
  const id = req.params.id;
  const data = {
    paySystem : req.body.paySystem,
    account   : req.body.account,
    cost      : req.body.cost
  };
  if (!id || id.length == 0 || typeof(id) == 'undefined'){
    res.status(400).send('Bad request');
  } else {
    orders.setPaidStatus(id, function(err, result){
      if (err){
        if (err.kind == "ObjectId")
          res.status(400).send('Bad ID');
        else if (err == "Status don't right")
          res.status(400).send(err)
        else 
          return next (err);
      } else {
        if (result) {              
          res.status(200).send(result);
        } else {
          res.status(404).send('Order not found');
        }
      }
    });
  }
});

router.post('/:id/completed_order', function(req, res, next){
  const id = req.params.id;
  if (!id || id.length == 0 || typeof(id) == 'undefined'){
    res.status(400).send('Bad request');
  } else {
    orders.setCompletedStatus(id, function(err, result){
      if (err) {
        if (err.kind == "ObjectId")
          res.status(400).send('Bad ID');
        else if (err == "Status don't right")
          res.status(400).send(err)
        else 
          return next (err);
      } else {
        if (result) {
          res.status(200).send('Change status succesfully');
        } else {
          res.status(404).send('Not found order');
        }
      }
    });
  }
});

router.put('/createOrder', function(req, res, next){
  let item = {
    UserID    : req.body.userID,
    CarID     : req.body.carID,
    StartDate : validator.ConvertStringToDate(req.body.startDate),
    EndDate   : validator.ConvertStringToDate(req.body.endDate)
  };
  if (!item.UserID  || typeof(item.UserID) == 'undefined' || item.UserID.length == 0 ||
      !item.CarID   || typeof(item.CarID) == 'undefined'  || item.CarID.length == 0 ||
      !item.StartDate || typeof(item.StartDate) == 'undefined' || item.StartDate.length == 0 ||
      !item.EndDate || typeof(item.EndDate) == 'undefined' || item.EndDate.length == 0) {
      res.status(400).send('Bad request');
  } else {
    orders.createOrder(item, function(err, result){
      if (err)
        return next(err);
      else {
        if (result) {
          res.status(201).send(result);
        } else {
          res.status(500).send('Oooops');
        }
      }
    });
  }
});