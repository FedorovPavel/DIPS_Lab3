const express   = require('express'),
      router    = express.Router();
      mongoose  = require('mongoose');
      billings  = mongoose.model('Billing'),
      validator = require('./../validator/validator');

module.exports = function(app) {
  app.use('/billings', router);
};

router.post('/', function(req, res, next) {
  const param = {
    PaySystem : validator.checkPaySystem(req.body.paySystem),
    Account   : validator.checkAccount(req.body.account),
    Cost      : validator.checkCost(req.body.cost)
  };
  if (typeof(param.Account)   == 'undefined'  || !param.Account   || 
      typeof(param.PaySystem) == 'undefined'  || !param.PaySystem ||
      typeof(param.Cost)      == 'undefined'  || !param.Cost){
        if (typeof(param.PaySystem) == 'undefined'){
          res.status(400).send({status : 'Error', message : 'Bad request : PaySystem is undefined'});
          return;
        } else if (!param.PaySystem){
          res.status(400).send({status : 'Error', message : 'Bad request : Invalid PaySystem'});
          return;
        } else if (typeof(param.Account)  == 'undefined'){
          res.status(400).send({status : 'Error', message : 'Bad request : Account is undefined'});
          return;
        } else if (!param.Account){
          res.status(400).send({status : 'Error', message : 'Bad request : Invalid Account'});
          return;
        } else if (typeof(param.Cost) == 'undefined'){
          res.status(400).send({status : 'Error', message : 'Bad request : Cost is undefined'});
          return;
        } else if (!param.Cost){
          res.status(400).send({status : 'Error', message : 'Bad request : Invalid cost'});
          return;
        }
  } else {
    billings.createBillingRecord(param, function(err, billing){
      if (err)
        res.status(400).send({status:'Error', message : err});
      else {
        res.status(200).send(billing);
      }
    });
  }
});

router.get('/:id', function(req, res, next){
  const id = req.params.id;
  if (!id || typeof(id) == 'undefined' || id.length == 0)
    res.status(400).send({status : 'Error', message : 'Bad request: ID is undefined'});
  else {
    billings.getBillingRecord(id, function(err, billing){
      if (err)
        res.status(400).send({status : 'Error' , message : err});
      else {
        if (billing){
          res.status(200).send(billing);
        } else {
          res.status(404).send({status : 'Error', message : 'Billing not found'});
        }
      }
    });
  }
});

router.options('/live', function(req, res, next){
  res.status(200).send(null);
});