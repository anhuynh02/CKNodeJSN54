var express = require('express');
var router = express.Router();
var AdminController = require("../controllers/AdminController");
var ProductController = require("../controllers/ProductController");
/* GET admin listing. */
router.use('/', (req,res, next)=>{
  if(req.session.userRole != 0){
    return res.render('admin/out-permission')
  }else{
    next();
  }
});
router.get('/', AdminController.GetAdmin);

router.get('/employees', AdminController.GetEmployee);
router.get('/changePass', AdminController.GetChangeAdminPassword);

router.get('/employees/:id', AdminController.GetOneEmployee)
router.put('/changeStatusEmployee', AdminController.PutStatusEmp);
router.post("/GetUserInfo", AdminController.PostGetUserInfo)
router.post("/AdminChangePassword", AdminController.PutChangeAdminPassword)
router.put("/updateEmployee", AdminController.PutUpdateEmployee)


router.get('/products', ProductController.GetProduct);
router.post("/addProduct", ProductController.PostAddProduct);
router.post("/getProductInfo", ProductController.PostGetProductInfo);
router.put("/updateProduct", ProductController.PutUpdateProduct);
router.post("/deleteProduct", ProductController.postDeleteProduct);

const SalesController = require('../controllers/SalesController');
// for report and analysis in dashboard-pane
router.get('/sales/today', SalesController.getSalesToday)
router.get('/sales/7daysago', SalesController.getSales7DaysAgo)
router.get('/sales/thismonth', SalesController.getSalesThisMonth)
router.get('/sales/:start/:end', SalesController.getSalesInRange)
router.get('/sales/:id', SalesController.getSalesInvoiceDetails)

// for report and analysis in employee-detail-pane
router.get('/employees/:empId/sales/today', SalesController.getSalesTodayEmployee)
router.get('/employees/:empId/sales/7daysago', SalesController.getSales7DaysAgoEmployee)
router.get('/employees/:empId/sales/thismonth', SalesController.getSalesThisMonthEmployee)
router.get('/employees/:empId/sales/:start/:end', SalesController.getSalesInRangeEmployee)
router.get('/employees/:empId/sales/:id', SalesController.getSalesInvoiceDetails)

module.exports = router;