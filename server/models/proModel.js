var mongoose = require('mongoose');
var proSchema = require('../schemas/proSchema');

var proModel =  mongoose.model('project',proSchema);

module.exports = proModel;
