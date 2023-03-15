const mongoose = require('mongoose');

const adminData = new mongoose.Schema({
    username: {
        type: String,
        requird: true
    },
    email: {
        type: String,
        requird: true
    },
    password: {
        type: Number,
        required: true
    }
})

module.exports = mongoose.model('admin', adminData);

