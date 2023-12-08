var express = require('express');
var router = express.Router();
var TransactionController = require("../controllers/TransactionController") 

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.session.userId){

    return res.render('transaction/transaction', {userId: req.session.userId, userName: req.session.userName});
  }else{
    return res.redirect('/login')
  }
});
router.post("/getCustomer", TransactionController.GetCustomer)
router.post("/addCustomer", TransactionController.PostAddCustomer)
router.post("/getProduct", TransactionController.PostGetProduct)
router.post("/addNewInvoice", TransactionController.PostAddNewInvoice)
router.post("/addInvoiceDetail", TransactionController.PostAddInvoiceDetail)
router.post("/getInvoiceDetail", TransactionController.PostGetInvoiceDetail)
router.post("/getProductFromInvoiceDetail", TransactionController.PostGetProductFromInvoiceDetail)
router.put("/updateQty", TransactionController.PutUpdateQty)
router.put("/payment", TransactionController.PostPayment)
router.put("/deleteInvoideDetail", TransactionController.PutDeleteInvoiceDetail)
module.exports = router;
