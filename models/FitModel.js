let mongoose = require('mongoose');

// Schema
let FitSchema = mongoose.Schema({
    FitName:{
        type: String,
        required: true
    },
    FitJson:{
        type: String,
        required: true
    },
    T3:{
        type: Boolean,
        required: true
    }
});

let Fit = module.exports = mongoose.model('Fit', FitSchema, 'FitModel');