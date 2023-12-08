var express = require('express');
var router = express.Router();
var AdminController = require("../controllers/AdminController");

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

// AdminController.GetOneEmployee
router.get('/employees/:id', AdminController.GetOneEmployee)

router.get('/products', AdminController.GetProduct);
router.put('/changeStatusEmployee', AdminController.PutStatusEmp);

router.post("/GetUserInfo", AdminController.PostGetUserInfo)
router.post("/AdminChangePassword", AdminController.PutChangeAdminPassword)
router.put("/updateEmployee", AdminController.PutUpdateEmployee)

const salesController = require('../controllers/salesController');
// for report and analysis in dashboard-pane
router.get('/sales/today', salesController.getSalesToday)
router.get('/sales/7daysago', salesController.getSales7DaysAgo)
router.get('/sales/thismonth', salesController.getSalesThisMonth)
router.get('/sales/:start/:end', salesController.getSalesInRange)
router.get('/sales/:id', salesController.getSalesInvoiceDetails)

// for report and analysis in employee-detail-pane
router.get('/employees/:empId/sales/today', salesController.getSalesTodayEmployee)
router.get('/employees/:empId/sales/7daysago', salesController.getSales7DaysAgoEmployee)
router.get('/employees/:empId/sales/thismonth', salesController.getSalesThisMonthEmployee)
router.get('/employees/:empId/sales/:start/:end', salesController.getSalesInRangeEmployee)
router.get('/employees/:empId/sales/:id', salesController.getSalesInvoiceDetails)

module.exports = router;