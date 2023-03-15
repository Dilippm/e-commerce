const mongoose = require('mongoose');
const product = require('../models/productData')

const userData = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  status: {
    type: Boolean,
    default: false
  },
  wallet: {
    type: Number,
  },
  cart: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    },
    quantity: {
      type: Number,
      default: 1
    },
    productTotalPrice: {
      type: Number,
      required: true,
    },
  }],
  totalPrice: {
    type: Number,
    default: 0
  }
  ,
  address: [
    {
      name: {
        type: String,
        required: true
      },
      houseName: {
        type: String,
        required: true
      },
      street: {
        type: String,
        required: true
      },
      district: {
        type: String,
        required: true
      },
      state: {
        type: String,
        required: true
      },
      pincode: {
        type: String,
        required: true
      },
      country: {
        type: String,
        required: true
      },
      phone: {
        type: Number,
        required: true
      },
    }
  ],
  wishlist: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "product",
      required: true,
    }
  }],


})




module.exports = mongoose.model('user', userData);