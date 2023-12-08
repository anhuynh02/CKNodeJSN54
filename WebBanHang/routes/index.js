var express = require("express");
var router = express.Router();
var IndexController = require("../controllers/IndexController");

router.get("/", function (req, res, next) {
  if(req.session.userId){
    return res.render("transaction/transaction", {
      title: "TdtuSales",
      userId: req.session.userId,
      userName: req.session.userName,
    });
  }else{
    return res.redirect("/login")
  }
});

// Middleware để kiểm tra trạng thái phiên, không áp dụng cho "/logout"
router.use(/^(?!\/logout$)/, (req, res, next) => {
  if (req.session && req.session.userId) {
    if (req.session.userStatus == 0) {
      return res.render("lock");
    } else {
      next();
    }
  } else {
    // Handle scenarios where session userId is not set
    next();
  }
});

// Các tuyến đường khác
router.get("/login", IndexController.GetLogin);
router.get("/login/:token", IndexController.GetLoginLink);
router.post("/login", IndexController.PostLogin);
router.post("/addEmployee", IndexController.PostAddEmployee);
router.get("/logout", IndexController.GetLogout);
router.post("/changePw", IndexController.PostChangePassword);
router.post("/resendAccessLink", IndexController.ResendAccessLink);
module.exports = router;
