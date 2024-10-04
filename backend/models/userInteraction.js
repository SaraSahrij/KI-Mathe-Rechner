const mongoose = require('mongoose');

const userInteractionSchema = new mongoose.Schema({
    userId: String,
    interactions: [{
        problem: String,
        solution: String,
        category: {type: String, default: 'unknown'},
        date: {type: Date, default: Date.now}
    }]
});

module.exports = mongoose.model('UserInteraction', userInteractionSchema);
