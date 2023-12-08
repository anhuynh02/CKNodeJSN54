const mongoose = require('mongoose');


var db = mongoose.createConnection('mongodb+srv://Zephia:sx9sIwU5e3WeDN0W@appbanhang.zsp1fr6.mongodb.net/WebBanHang');

const { Schema, model } = mongoose;

//construct "product" schema
const ProductSchema = new Schema({
    name: String,
    barcode: Number,
    price: Number,
    iPrice: {type: Number, default: 0},
    desc: {type: String, default: 'This is a device'},
    img: {type: String, default: 'img.png'},
    category: {type: String, default: 'Phone'},
    amount: Number,
    createdAt: {type: Date, default: Date.now},
    status: {type: Number, default: 1},
});

//create the schema in database
const Product = db.model('Product', ProductSchema);
module.exports = Product;
