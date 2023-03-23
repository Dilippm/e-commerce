const { ObjectId } = require("mongodb");
const mongoose = require('mongoose');

const productData = mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  images: [{

    type: String,
    required: true,
  }],
  offers: [{

    discount: {
      type: Number,
      required: true
    }

  }],
  listed: {
    type: Boolean,
    default: true
  }
});

module.exports = mongoose.model('product', productData);