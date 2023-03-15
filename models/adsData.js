const mongoose = require("mongoose");

const AdsData = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  image: {
    type: Array,
    required: true
  },


});

module.exports = mongoose.model('Ads', AdsData);
