let mongoose = require('mongoose');

let regionSchema = mongoose.Schema({
    RegionId: {
        type: Number
    },
    RegionName: {
        type: String
    }
});
let Region = mongoose.model('Region', regionSchema, 'Regions');

let systemSchema = mongoose.Schema({
    SystemId: {
        type: Number
    },
    SystemName: {
        type: String
    },
    Region: {
        type: mongoose.Schema.Types.ObjectId,
        ref: Region
    },
});
let System = mongoose.model('System', systemSchema, 'Systems');

let sovSchema = mongoose.Schema({
    System: {
        type: mongoose.Schema.Types.ObjectId,
        ref: System
    },
    Index: {
        type: Number
    }
});
let SovLevel = mongoose.model('SovLevel', sovSchema, 'SovLevel');

let systemKillSchema = mongoose.Schema({
    System: {
        type: mongoose.Schema.Types.ObjectId,
        ref: System
    },
    npcKills: {
        type: Number
    },
    npcDelta: {
        type: Number
    },
    podKills: {
        type: Number
    },
    shipKills: {
        type: Number
    }
});
let SystemKill = mongoose.model('SystemKill', systemKillSchema, 'SystemKills');

module.exports = {
    Region: Region,
    System: System,
    SovLevel: SovLevel,
    SystemKill: SystemKill
};
