var express   = require('express'),
    router    = express.Router(),
    bus       = require('./../coordinator/bus'),
    validator = require('./../validator/validator'),
    amqp = require('amqplib/callback_api'),
    interval  = 20000;// 20s to repeate check live
    

module.exports = function (app) {
  app.use('/aggregator', router);
};

function addIdOrderToQueue(id) {
  amqp.connect('amqp://localhost', function(err, conn){
    conn.createChannel(function(err, ch){
      var queue = 'orders_id';
      
      ch.assertQueue(queue, {durable : false});
      ch.sendToQueue(queue, Buffer.from(id),{persistent : true});
      console.log('ID : ' + id + ' added to queue [' + queue + ']');
    });
    setTimeout(function() {conn.close()},500);
  });
}

function receiveIdOrderFromQueue(callback){
  amqp.connect('amqp://localhost', function(err, conn){
    conn.createChannel(function(err, ch){
      var queue = 'orders_id';

      ch.assertQueue(queue, {durable : false});
      ch.consume(queue, function(id){
        const _id = id.content.toString('utf-8');
        console.log('in queue exist id: ' + _id);
        callback(_id);
      }, {noAck : true});
      setTimeout(function(){
        conn.close();
        callback(null);
      },500);
    });
  });
}

setInterval(function(){
  bus.checkOrderService(function(err, status){
    if (status == 200){
      receiveIdOrderFromQueue(function(id){
        if (id){
          bus.orderComplete(id, function(err, status){
            if (err)
              addIdOrderToQueue(id);
            else {
              if (status == 200){
                console.log('id '+ id + 'processed');
              } else if (status == 500) {
                addIdOrderToQueue(id);
              } else {
                console.log('request to complete order with [' + id + '] return status : ' + status);
              }
            }
          });
        }
      });
    }
  });
}, interval);

// Get any cars
router.get('/catalog', function(req, res, next){
  let page  = validator.checkPageNumber(req.query.page);
  let count = validator.checkCountNumber(req.query.count);
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
    res.status(400).send({status : 'Error', message : 'Bad request: ID is undefined'});
  } else {
    bus.getCar(id, function(err, statusCode, responseText){
      if (err)
        return next(err);
      else 
        res.status(statusCode).send(responseText);
    });
  }
});

//  Create Order
router.post('/orders/', function(req, res, next){
  const param = {};
  const userID = validator.checkID(req.body.userID);
  if (typeof(userID) == 'undefined'){
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid user ID'});
    return;
  }
  param.userID = userID;
  const carID = validator.checkID(req.body.carID);
  if (typeof(carID) == 'undefined'){
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid car ID'});
    return;
  }
  param.carID = carID;
  const startDate = validator.ConvertStringToDate(req.body.startDate);
  if (startDate){
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid start rent date'});
    return;
  }
  param.startDate = startDate;
  const endDate = validator.ConvertStringToDate(req.body.endDate);
  if (!item.EndDate) {
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid end rent date'});
    return;
  }
  param.endDate;
  bus.createOrder(param, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});

//  Get order
router.get('/orders/:order_id', function(req, res, next){
  const order_id = validator.checkID(req.params.order_id);
  if (typeof(order_id) == 'undefined') {
    res.status(400).send({status : 'Error', message : 'Bad request: Invalid ID'});
    return;
  }
  bus.getOrder(order_id, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});

//  Get orders(new version)
/* router.get('/orders', function(req, res, next){
  let page  = validator.checkPageNumber(req.query.page);
  let count = validator.checkCountNumber(req.query.count);
  bus.getOrders(page, count, function(err, status, orders){
    if (err)
      res.status(status).send(orders);
    else {
      let carId = [];
      let billingId = [];
      for (let I = 0; I < orders.length; I++){
        if (carId.indexOf(orders[I].CarID) == -1)
          carId.push(orders[I].CarID);
        if (typeof(orders[I].BillingID) != 'undefined')
          billingId.push(orders[I].BillingID);
      }
      bus.getCarsByIDs(carId,function(err, status, cars){
        if (err){
          for (let I = 0; I < orders.length; I++)
            orders[I].CarID = "Неизвестно";
        } else {
          cars = Array.from(cars);
          for (let I = 0; I < orders.length; I++){
            const car = orders[I].CarID;
            delete orders[I].CarID;
            const index = cars.findIndex(function(elem, index, arr){
              if (elem.id == car)
                return index;
              return false;
            });
            orders[I].Car = cars[index];
          }
        }
        busGetBillingsIDs(billingId, function(err, status, billings){
          if (err) {
            for (let I = 0; I < orders.length; I++){
              orders[I].BillingID = 'Неизвестно';
            }
          } else {
            billings = Array.from(billings);
            for (let I = 0; I < orders.length; I++) {
              const billing = orders[I].BillingID;
              delete orders[I].BillingID;
              if (typeof(billing) != 'undefined'){
                const index = billings.findIndex(function(elem, index, arr){
                  if (elem.id == billing)
                    return index;
                  return false;
                });
                orders[I].Billing = billings[index];
              }
            }
          }
          res.status(200).send(orders);
        });
      });
    }
  });
});*/

//  Get orders(last version)
router.get('/orders', function(req, res, next){
  let page  = validator.checkPageNumber(req.query.page);
  let count = validator.checkCountNumber(req.query.count);
  bus.getOrders(page, count, function(err, status, orders){
    if (err)
      res.status(status).send(orders);
    else {
      let _counter_to_ready_order = 0;
      if (orders){
        for (let I = 0; I < orders.length; I++){
          const car_id = orders[I].CarID;
          bus.getCar(car_id, function(err, status, car){
            delete orders[I].CarID;
            if (err){
              orders[I].Car = 'Неизвестно';
            } else {
              if (car && status == 200){
                orders[I].Car = car;
              } else {
                orders[I].Car = 'Неизвестно';
              }
            }
            if (typeof(orders[I].BillingID) != 'undefined'){
              const billing_id = orders[I].BillingID;
              bus.getBilling(billing_id, function(err, status, billing){
                delete orders[I].BillingID;
                if (err){
                  orders[I].Billing = 'Неизвестно';
                } else {
                  if (billing && status == 200){
                    orders[I].Billing = billing;
                  } else {
                    orders[I].Billing = 'Неизвестно';
                  }
                }
                _counter_to_ready_order++;
                if (_counter_to_ready_order == orders.length){
                  res.status(200).send(orders);
                }
              });
            } else {
              _counter_to_ready_order++;
              if (_counter_to_ready_order == orders.length){
                res.status(200).send(orders);
              }
            }
          });
        }
      } else {
        res.status(status).send(null);
      }
    }
  });
});

router.post('/orders/paid/:id', function(req, res, next){
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

router.post('/orders/completed/:oid', function(req, res, next){
  const uid = req.params.id;
  const id = req.params.oid;
  bus.orderComplete(id, function(err, status, response){
    if (err){
      if (status == 500) {
        addIdOrderToQueue(id);
        res.status(202).send('Change status succesfully');
      }else {
        res.status(status).send(response);
      }
    } else {
      res.status(status).send(response);
    }
  });
});

router.post('/billings', function(req, res, next){
  let data = {};
  const paySystem = validator.checkPaySystem(req.body.paySystem);
  if (typeof(paySystem) == 'undefined') {
    res.status(400).send({status : 'Error', message : 'Bad request : PaySystem is undefined'});
    return;
  }
  if (!paySystem){
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid PaySystem'});
    return;
  }
  data.paySystem = paySystem;
  const account = validator.checkAccount(req.body.account);
  if (typeof(account)  == 'undefined') {
    res.status(400).send({status : 'Error', message : 'Bad request : Account is undefined'});
    return;
  }
  if (!account){
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid Account'});
    return;
  }
  data.account = account;
  const cost  = validator.checkCost(req.body.cost);
  console.log(cost);
  if (typeof(cost) == 'undefined'){
    res.status(400).send({status : 'Error', message : 'Bad request : Cost is undefined'});
    return;
  }
  if (!cost){
    res.status(400).send({status : 'Error', message : 'Bad request : Invalid cost'});
    return;
  }
  data.cost = cost;
  bus.createBilling(data, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});

router.get('/billings/:id', function(req, res, next){
  const id = validator.checkID(req.params.id);
  if (typeof(id) == 'undefined'){
    res.status(400).send({status : 'Error', message : 'Bad request : id is not valid'});
  }
  bus.getBilling(id, function(err, status, response){
    if (err)
      return next(err);
    else {
      res.status(status).send(response);
    }
  });
});