var User = require("../models/User");
var bcrypt = require("bcrypt");
var { body, validationResult } = require("express-validator");
const multer = require("multer");
const path = require("path");
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const multiparty = require("multiparty");
const fs = require("fs");
const mv = require("mv");

class UserController {
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
      { _id: req.session.userId },
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
            message: "Upload success",
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

  async PostChangePassword(req, res) {
    try {
      await body("old")
        .notEmpty()
        .withMessage("Vui lòng nhập mật khẩu hiện tại")
        .trim()
        .escape()
        .run(req);

      await body("new")
        .notEmpty()
        .withMessage("Vui lòng nhập mật khẩu mới")
        .trim()
        .escape()
        .run(req);

      const errors = validationResult(req);

      let { oldErr, newErr } = "";
      if (!errors.isEmpty()) {
        errors.array().forEach((err) => {
          switch (err.path) {
            case "old":
              oldErr = err.msg;
              break;
            case "new":
              newErr = err.msg;
              break;
          }
        });
        return res.status(400).json({
          success: false,
          oldErr: oldErr,
          newErr: newErr,
        });
      }

      const user = await User.findOne({ _id: req.session.userId });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      const isOldPasswordCorrect = await bcrypt.compare(
        req.body.old,
        user.pass
      );

      if (!isOldPasswordCorrect) {
        return res.status(400).json({
          success: false,
          message: "Mật khẩu cũ không chính xác",
        });
      }

      const hashedPassword = await bcrypt.hash(req.body.new, 10);
      await user.updateOne({ pass: hashedPassword });

      return res.status(200).json({
        success: true,
        message: "Password updated successfully",
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        success: false,
        message: "Internal Server Error",
      });
    }
  }
  PostUpdateImage(req, res) {
    User.findById(req.session.userId).then((user) => {
      if (!user) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      } else {
        const form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
          if (err) return res.status(500).send(err.message);
          let dir = path.join(__dirname, "../public/images/users");

          console.log(dir);
          if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
          }
          
          let image = files.file[0]
          if (isImageFile(image.originalFilename)) {
            const newPath = path.join(dir, user._id.toString()+'.png');
            let imgName = user._id.toString()
            mv(image.path, newPath, function (err) {
              if (err) throw err;
              user
                .updateOne({
                  avatarPath: user._id.toString()+'.png',
                })
                .then(() => {
                    return res.status(200).json({
                        success: true,
                        avatarPath: user._doc.avatarPath
                    })
                })
                .catch((error) => {
                  console.log(error);
                  return res.send(error);
                });
            });
          } else {
            return res.status(400).json({
                success: false,
                message: "Không hỗ trợ định dạng này"
            });
          }
        });
      }
    });
  }

  
}

function isImageFile(filename) {
  const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".bmp"];
  const extension = filename.substring(filename.lastIndexOf(".")).toLowerCase();
  return imageExtensions.includes(extension);
}

module.exports = new UserController();
