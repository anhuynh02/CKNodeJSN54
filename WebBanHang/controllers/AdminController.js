var User = require("../models/User");
var bcrypt = require("bcrypt");
var { body, validationResult } = require("express-validator");

class AdminController {
  GetAdmin(req, res) {
    return res.render("admin/dashboard", {
      layout: "admin-layout",
    });
  }
  GetChangeAdminPassword(req, res) {
    return res.render("admin/admin-change-password");
  }
  GetEmployee(req, res) {
    User.find({ role: 1 })
      .then((users) => {
        let result = [];
        users.forEach((user) => {
          result.push(user._doc);
        });
        return res.render("admin/employee", {
          layout: "admin-layout",
          error: false,
          Users: result,
        });
      })
      .catch((err) => {
        return res.render("admin/employee", {
          layout: "admin-layout",
          error: true,
          msg: err,
        });
      });
  }
  GetOneEmployee(req, res) {
    User.findById(req.params.id).then((user) => {
      if (!user) {
        return res.render("admin/employee-detail", { layout: "admin-layout" });
      } else {
        res.render("admin/employee-detail", {
          layout: "admin-layout",
          employee: user._doc,
        });
      }
    });
  }
  GetProduct(req, res) {
    return res.render("admin/product", { layout: "admin-layout" });
  }
  PutStatusEmp(req, res) {
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy user",
          });
        } else {
          // Toggle the user's status
          const newStatus = !user.status;

          User.findOneAndUpdate(
            { email: req.body.email },
            { status: newStatus }
          )
            .then(() => {
              return res.status(200).json({ success: true });
            })
            .catch((error) => {
              return res.status(500).json({
                success: false,
                message: "Internal server error: " + error.message,
              });
            });
        }
      })
      .catch((error) => {
        return res.status(500).json({
          success: false,
          message: "Internal server error: " + error.message,
        });
      });
  }
  PostGetUserInfo(req, res) {
    User.findById(req.body.id)
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy user",
          });
        } else {
          return res.status(200).json({
            success: true,
            User: user,
          });
        }
      })
      .catch((err) => {
        return res.status(500).json({
          success: false,
          message: "Internal server error: " + error.message,
        });
      });
  }
  async PutUpdateEmployee(req, res) {
    await body("name")
      .notEmpty()
      .withMessage("Vui lòng nhập tên")
      .trim()
      .escape()
      .run(req);
    await body("gender")
      .notEmpty()
      .withMessage("Vui lòng chọn giới tính")
      .trim()
      .escape()
      .run(req);
    await body("address")
      .notEmpty()
      .withMessage("Vui lòng nhập địa chỉ")
      .trim()
      .escape()
      .run(req);
    await body("birth")
      .notEmpty()
      .withMessage("Vui lòng nhập ngày sinh")
      .trim()
      .escape()
      .run(req);
    await body("phone")
      .notEmpty()
      .withMessage("Vui lòng nhập sđt")
      .trim()
      .escape()
      .run(req);
    // Check for validation errors
    const errors = validationResult(req);
    let { nameErr, emailErr, genderErr, addressErr, birthErr, phoneErr } = "";
    if (!errors.isEmpty()) {
      errors.array().forEach((err) => {
        switch (err.path) {
          case "name":
            nameErr = err.msg;
            break;
          case "gender":
            genderErr = err.msg;
            break;
          case "address":
            addressErr = err.msg;
            break;
          case "birth":
            birthErr = err.msg;
            break;
          case "phone":
            phoneErr = err.msg;
            break;
        }
      });
      return res.status(400).json({
        success: false,
        body: req.body,
        nameErr: nameErr,
        genderErr: genderErr,
        addressErr: addressErr,
        birthErr: birthErr,
        phoneErr: phoneErr,
      });
    }

    User.findOneAndUpdate(
      { _id: req.body.id },
      {
        name: req.body.name,
        gender: req.body.gender,
        address: req.body.address,
        birth: req.body.birth,
        phone: req.body.phone,
      }
    )
      .then((user) => {
        if (!user) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy user",
          });
        } else {
          return res.status(200).json({
            success: true,
            mesage: "Upload success",
          });
        }
      })
      .catch((err) => {
        return res.status(500).json({
          success: false,
          message: "Internal server error: " + err.message,
        });
      });
  }
  async PutChangeAdminPassword(req, res) {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    User.findOneAndUpdate(
      { email: "admin@gmail.com" },
      { pass: hashedPassword }
    )
      .then((user) => {
        if (!user) {
          return res.render("admin/admin-change-password", {
            success: false,
            message: "Unexisted Admin",
          });
        } else {
          return res.render("admin/admin-change-password", {
            success: true,
            message: "Change password successful",
          });
        }
      })
      .catch((err) => {
        console.error(err); // In thông báo lỗi ra console để kiểm tra và gỡ lỗi
        return res.status(500).render("admin/admin-change-password", {
          success: false,
          message: "An error occurred",
        });
      });
  }
}

module.exports = new AdminController();
