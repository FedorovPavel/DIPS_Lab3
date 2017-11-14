const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BillingSchema = new Schema({
  PaySystem       : String,
  Account         : String,
  Cost            : {type : Number, min: 10.0},
  DateOfPayment   : Date
});

BillingSchema.virtual('date')
  .get(() => this._id.getTimestamp());

BillingSchema.statics.getBillingRecord = function(id, callback){
  if (!id || typeof(id) == 'undefined' || id.length == 0)
    return callback('ID is undefined', null);
  this.findById(id, function(err, record){
    if (err) {
      return callback(err, null);
    } else {
      if (record){
        return callback(null,getBillingRecordInfo(record));
      } else {
        return callback(null, null);
      }
    }
  });
}

BillingSchema.statics.createBillingRecord = function(object, callback){
  if (!object || typeof(object) == 'undefined' || typeof(object) != 'object')
    return callback('Params is undefined', null);
  let record = createBillingRecordInfo(object);
  return record.save(function(err, result){
    if(err)
      return callback(err, null);
    else {
      if (result){
        let res = getBillingRecordInfo(result);
        return callback(null, res);
      } else {
        return callback('Not saved', null);
      }
    }
  });
}

mongoose.model('Billing', BillingSchema);

function getBillingRecordInfo(record){
  let item = {
    'id'            : record._id,
    'PaySystem'     : record.PaySystem,
    'Account'       : record.Account,
    'Cost'          : record.Cost,
    'DateOfPayment' : record.DateOfPayment
  };
  return item;
}

function createBillingRecordInfo(object){
  const model = mongoose.model('Billing');
  let record = new model();
  const keys = Object.keys(object);
  for (let I = 0; I < keys.length; I++){
    switch(keys[I].toLowerCase()){
      case 'paysystem'  : 
        record.PaySystem = object[keys[I]];
        break;
      case 'account'    :
        record.Account = object[keys[I]];
        break;
      case 'cost'       :
        record.Cost = object[keys[I]];
    }
  }
  record.DateOfPayment = Date.now();
  return record;
}