const mongoose = require("mongoose");

const cartData = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    productId: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1
    },
    status: {
        type: Number,
        default: true
    }


});
module.exports = mongoose.model('Cart', cartData);