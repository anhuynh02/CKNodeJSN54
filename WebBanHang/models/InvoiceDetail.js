const { now } = require('mongoose');
const mongoose = require('mongoose');

var db = mongoose.createConnection('mongodb+srv://Zephia:sx9sIwU5e3WeDN0W@appbanhang.zsp1fr6.mongodb.net/WebBanHang?retryWrites=true&w=majority');

const { Schema, model } = mongoose;

const InvoiceDetailSchema = new Schema({
    productId: {type: Schema.Types.ObjectId, ref: 'Product'},
    price: Number,
    qty: Number,
    amount: Number,
    createdAt: {type: Date, default: now},
    status: {type: Number, default: 1},
});

const InvoiceDetail = db.model('InvoiceDetail', InvoiceDetailSchema);
module.exports = InvoiceDetail;