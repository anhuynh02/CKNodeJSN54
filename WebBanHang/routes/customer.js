var express = require('express');
var router = express.Router();
var CustomerController = require("../controllers/CustomerController")

router.use('', function(req, res, next) {
    if(req.session.userId){
        next()
    }else{
      return res.redirect('/login')
    }
  });
router.get("/:id", CustomerController.getCustomer)
router.post("/getInvoice", CustomerController.GetInvoiceById)
module.exports = router