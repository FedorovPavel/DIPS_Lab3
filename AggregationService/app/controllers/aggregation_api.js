var express   = require('express'),
    router    = express.Router(),
    bus       = require('./../coordinator/bus'),
    validator = require('./../validator/validator');

module.exports = function (app) {
  app.use('/aggregator', router);
};

// Get any cars
router.get('/catalog', function(req, res, next){
  const page  = validator.checkPosIntNumber(req.query.page);
  const count = validator.checkPosIntNumber(req.query.count);
  bus.getCars(page, count, function(err, statusCode, responseText){
    if (err)
      return next(err);
    else {
      res.status(statusCode).send(responseText);
    }
  });
});

//  Get car by ID
router.get('/catalog/:id', function(req, res, next){
  const id = validator.checkID(req.params.id);
  if (typeof(id) == 'undefined'){
    res.status(400).send({status : 'Error', message : 'Bad request'});
  } else {
    bus.getCar(id, function(err, statusCode, responseText){
      if (err)
        return next(err);
      else 
        res.status(statusCode).send(responseText);
    });
  }
});

router.post('/orders/:id', function(req, res, next){
  const param = {
    userID  : req.params.id,
    carID   : req.body.carID,
    startDate : req.body.startDate,
    endDate   : req.body.endDate
  };
  bus.createOrder(param, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});

router.get('/orders/:id/getOrder/:order_id', function(req, res, next){
  const order_id = req.params.order_id;
  bus.getOrder(order_id, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});

router.get('/orders/getOrders/:id/:page/:count', function(req, res, next){
  const id = req.params.id;
  const page = req.params.page;
  const count = req.params.count;
  bus.getOrders(id, page, count, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});

router.post('/orders/:id/order_paid', function(req, res, next){
  const id = req.params.id;
  const data = {
    paySystem : req.body.paySystem,
    account   : req.body.account,
    cost      : req.body.cost
  }
  bus.orderPaid(id, data, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});

router.post('/orders/:uid/confirm_order/:oid', function(req, res, next){
  const uid = req.params.id;
  const id = req.params.oid;
  bus.orderConfirm(id, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});

router.post('/orders/:uid/completed_order/:oid', function(req, res, next){
  const uid = req.params.id;
  const id = req.params.oid;
  bus.orderComplete(id, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});

router.post('/billings/:uid/createBilling/', function(req, res, next){
  const uid = req.params.id;
  const data = {
    paySystem : req.body.paySystem,
    account   : req.body.account,
    cost      : req.body.cost
  }
  bus.createBilling(data, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});

router.get('/billings/:uid/getBilling/:bid', function(req, res, next){
  const uid = req.params.id;
  const bid = req.params.bid;
  bus.getBilling(bid, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});