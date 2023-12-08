var Invoice = require("../models/Invoice");
var Customer = require("../models/Customer");

class CustomerController {
    async getCustomer(req, res) {
        try {
            const customer = await Customer.findOne({ _id: req.params.id });
    
            if (!customer) {
                return res.render("customer", {
                    success: false,
                    message: "Không tìm thấy khách hàng",
                });
            }
    
            const invoices = await customer.getInvoices();
    
    
            return res.render("customer", {
                success: true,
                Customer: customer._doc,
                Invoices: invoices,
            });
        } catch (error) {
            console.error(error);
            return res.status(500).render("customer", {
                success: false,
                message: "Internal Server Error",
            });
        }
    }
    GetInvoiceById(req,res){
        Invoice.findById(req.body.id).then(invoice=>{
            if(!invoice){
                return res.status(404).json({
                    success: false,
                    message:"Không tìm thấy hóa đơn"
                })
            }else{
                return res.status(200).json({
                    success: true,
                    invoice: invoice
                })
            }
        }).catch(err=>{
            return res.status(500).json({
                success: false,
                message: "Lỗi khi tìm hóa đơn: "+ err
            })
        })
    }
}
module.exports = new CustomerController();
