const Invoice = require("./Invoice");
const { now } = require("mongoose");
const mongoose = require("mongoose");
var db = mongoose.createConnection(
  "mongodb+srv://Zephia:sx9sIwU5e3WeDN0W@appbanhang.zsp1fr6.mongodb.net/WebBanHang?retryWrites=true&w=majority"
);
const { Schema, model } = mongoose;

const CustomerSchema = new Schema({
  phone: String,
  name: String,
  address: String,
  invoices: [{ type: Schema.Types.ObjectId, ref: "Invoice" }],
  createdAt: { type: Date, default: now },
  status: { type: Number, default: 1 },
});

CustomerSchema.methods.getInvoices = async function () {
  // Populate the invoices field and execute the query
  const invoiceObjects = await Invoice.find({ _id: { $in: this.invoices } });
  return invoiceObjects;
};
const Customer = db.model("Customer", CustomerSchema);
module.exports = Customer;
