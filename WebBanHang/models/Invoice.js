const { now } = require('mongoose');
const mongoose = require('mongoose');

var db = mongoose.createConnection('mongodb+srv://Zephia:sx9sIwU5e3WeDN0W@appbanhang.zsp1fr6.mongodb.net/WebBanHang?retryWrites=true&w=majority');

const { Schema, model } = mongoose;

const InvoiceSchema = new Schema({
    invoiceDetails: [{type: Schema.Types.ObjectId, ref: 'InvoiceDetail'}],
    totalItems: Number,
    totalAmount: Number,
    givenAmount: Number,
    excessAmount: Number,
    purchaseDate: Date,
    createdAt: {type: Date, default: now},
    status: {type: Number, default: 1},
    employeeId: {type: Schema.Types.ObjectId, ref: 'User'}
});

const Invoice = db.model('Invoice', InvoiceSchema);
module.exports = Invoice;