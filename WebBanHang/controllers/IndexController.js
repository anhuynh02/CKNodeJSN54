var User = require("../models/User");
var bcrypt = require("bcrypt");
var { body, validationResult } = require("express-validator");
const crypto = require("crypto");
var nodemailer = require("nodemailer");
var jwt = require("jsonwebtoken");

var secretKey = "thisisthesecretkeyforgroup54";
var { OAuth2Client } = require("google-auth-library");
const GOOGLE_MAILER_CLIENT_ID =
  "372161796669-4f24bsr9ppigfm8357skiok58hbh44kr.apps.googleusercontent.com";
const GOOGLE_MAILER_CLIENT_SECRET = "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";
const GOOGLE_MAILER_REFRESH_TOKEN =
  "1//04mkWRCi55gDPCgYIARAAGAQSNwF-L9Irj0i6rUhLYZsbmVGSpmAaHNNP_AY3mbrkgBgtCeac5W1lPMa5RQ-bv0efAMjXskwz8dg";
const ADMIN_EMAIL_ADDRESS = "huynhtrithong290102@gmail.com";

// Khởi tạo OAuth2Client với Client ID và Client Secret
const myOAuth2Client = new OAuth2Client(
  GOOGLE_MAILER_CLIENT_ID,
  GOOGLE_MAILER_CLIENT_SECRET
);
// Set Refresh Token vào OAuth2Client Credentials
myOAuth2Client.setCredentials({
  refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
});

class IndexController {
  //Login Part
  async GetLogin(req, res) {
    if (!req.session.userId) {
      return res.render("index/login");
    } else {
      return res.redirect("/");
    }
  }
  async PostLogin(req, res) {
    // Validation rules using express-validator
    await body("username")
      .notEmpty()
      .withMessage("Vui lòng nhập tên đăng nhập")
      .trim()
      .escape()
      .run(req);
    await body("password")
      .notEmpty()
      .withMessage("Vui lòng nhập mật khẩu")
      .run(req);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("index/login", {
        body: req.body,
        Err: errors.array()[0].msg,
      });
    }

    let condition = {
      username: req.body.username,
    };

    try {
      const users = await User.find(condition);
      if (users.length != 0) {
        const user = users[0]._doc;
        const passwordMatch = await bcrypt.compare(
          req.body.password,
          user.pass
        );

        if (!passwordMatch) {
          return res.render("index/login", {
            body: req.body,
            Err: "Sai mật khẩu",
          });
        }
        if (!user.isChange) {
          return res.render("index/login", {
            body: req.body,
            Err: "Vui lòng đăng nhập bằng link được gửi thông qua email",
          });
        }
        req.session.userId = user._id;
        req.session.userRole = user.role;
        req.session.userName = user.name;
        req.session.userStatus = user.status;
        if (user.role == 0) {
          return res.redirect("/admin");
        } else {
          if (user.status) {
            return res.redirect("/");
          } else {
            return res.render("lock");
          }
        }
      } else {
        console.log("Tài khoản không tồn tại");
        return res.render("index/login", {
          body: req.body,
          Err: "Tài khoản không tồn tại",
        });
      }
    } catch (err) {
      console.log(err);
    }
  }

  async GetLoginLink(req, res) {
    try {
      const decoded = jwt.verify(req.params.token, secretKey, {
        ignoreExpiration: false,
      });
      console.log("JWT is not expired:", decoded);
      let email = decoded.email;

      // Tìm kiếm người dùng có email tương ứng trong cơ sở dữ liệu
      const user = await User.findOne({ email: email });

      if (user) {
        req.session.userId = user._id;
        req.session.userName = user.name;
        if (!user.isChange) {
          req.session.userEmail = email;
          return res.render("index/firstlogin", {
            exp: true,
            msg: "Vui lòng đổi mật khẩu trước khi phiên đăng nhập kết thúc",
            email: email,
            changePw: true,
          });
        } else {
          // Nếu người dùng đã đổi mật khẩu, đưa họ đến trang chủ
          return res.redirect("/"); // Điều hướng đến trang chủ (thay đổi đường dẫn tùy theo ứng dụng của bạn)
        }
      } else {
        return res.render("index/firstlogin", {
          msg: "Người dùng không tồn tại",
        });
      }
    } catch (err) {
      if (err.name === "TokenExpiredError") {
        console.log(err);
        const decodedE = jwt.verify(req.params.token, secretKey, {
          ignoreExpiration: true,
        });
        const userE = await User.findOne({ email: decodedE.email });

        if (userE) {
          if (userE.isChange) {
            return res.render("index/firstlogin", {
              exp: false,
              isChange: true,
              msg: "Tài khoản đã kí hoạt vui lòng đăng nhập thông qua trang login",
            });
          }
        }
        console.log(decodedE.email);
        return res.render("index/firstlogin", {
          exp: false,
          isChange: false,
          msg: "Phiên đăng nhập hết hạn, hãy yêu cầu phiên đăng nhập mới",
          email: decodedE.email,
        });
      } else {
        console.log("JWT verification failed:", err);
        return res.render("index/firstlogin", { msg: "Lỗi xác thực" });
      }
    }
  }
  async ResendAccessLink(req, res) {
    try {
      await sendLoginLink(req.body.email);
      return res.status(200).json({ success: true });
    } catch (error) {
      return res
        .status(500)
        .json({ success: false, error: "Failed to send the access link" });
    }
  }

  async PostChangePassword(req, res) {
    if (!req.body.password) {
      return res.render("index/firstlogin", {
        passwordErr: "Không được bỏ trống mật khẩu",
      });
    }
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) {
        return res.status(500).json({ message: "Error hashing new password" });
      }
      User.findOneAndUpdate(
        {
          email: req.session.userEmail,
        },
        { pass: hashedPassword, isChange: 1 }
      )
        .then((message) => {
          let user = message._doc;
          console.log(message._doc.email);
          req.session.userId = user._id;
          req.session.userStatus = user.status;
          res.redirect("/");
        })
        .catch((error) => {
          res.status(400).json({ message: error });
        });
    });
  }
  async PostAddEmployee(req, res) {
    // Validation rules using express-validator
    await body("email")
      .notEmpty()
      .withMessage("Vui lòng nhập email")
      .isEmail()
      .withMessage("Địa chỉ email không hợp lệ")
      .normalizeEmail()
      .custom(async (value) => {
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          throw new Error("Tài khoản đã tồn tại");
        }
        return true;
      })
      .run(req);
    await body("name")
      .notEmpty()
      .withMessage("Vui lòng nhập tên")
      .trim()
      .escape()
      .run(req);

    // Check for validation errors
    const errors = validationResult(req);
    let { nameErr, emailErr } = "";
    if (!errors.isEmpty()) {
      errors.array().forEach((err) => {
        switch (err.path) {
          case "name":
            nameErr = err.msg;
            break;
          case "email":
            emailErr = err.msg;
            break;
        }
      });
      return res.status(400).json({
        success: false,
        body: req.body,
        nameErr: nameErr,
        emailErr: emailErr,
      });
    }

    try {
      const hashedPassword = await bcrypt.hash(
        getUsernameFromEmail(req.body.email),
        10
      );
      console.log(req.body.email);
      const newUser = new User({
        name: req.body.name,
        username: getUsernameFromEmail(req.body.email),
        pass: hashedPassword,
        role: 1,
        email: req.body.email,
        createdAt: new Date(),
        status: 1,
        avatarPath: "avatar.png",
        isChange: 0,
      });

      await newUser.save();
      sendLoginLink(req.body.email);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.log(err);
      return res
        .status(500)
        .json({ success: false, message: "Registration failed" });
    }
  }
  //Logout Part
  async GetLogout(req, res) {
    // Kiểm tra xem phiên tồn tại trước khi xóa
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          // Xử lý lỗi khi xóa phiên
          return res.status(500).send("Lỗi khi đăng xuất");
        } else {
          // Chuyển hướng sau khi xóa thành công
          return res.redirect("/");
        }
      });
    } else {
      // Phiên không tồn tại, có thể đã bị xóa trước đó
      return res.redirect("/");
    }
  }
}

function getUsernameFromEmail(email) {
  // Split the email address at the "@" symbol
  const parts = email.split("@");

  // The first part (parts[0]) is the username
  const username = parts[0];

  return username;
}
//Generate key for resending login link
function generateSecretKey() {
  // Generate a random 32-byte (256-bit) secret key using a strong cryptographic algorithm
  return crypto.randomBytes(32).toString("hex");
}

async function sendLoginLink(email) {
  // Generate a token with the user's email and set it to expire in 1 minute
  const token = jwt.sign({ email }, secretKey, { expiresIn: "1m" });

  // Create the login link with the token
  const loginLink = `http://localhost:3000/login/${token}`;

  const myAccessTokenObject = await myOAuth2Client.getAccessToken();
  // Access Token sẽ nằm trong property 'token' trong Object mà chúng ta vừa get được ở trên
  const myAccessToken = myAccessTokenObject?.token;

  // Tạo một biến Transport từ Nodemailer với đầy đủ cấu hình, dùng để gọi hành động gửi mail
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      type: "OAuth2",
      user: ADMIN_EMAIL_ADDRESS,
      clientId: GOOGLE_MAILER_CLIENT_ID,
      clientSecret: GOOGLE_MAILER_CLIENT_SECRET,
      refresh_token: GOOGLE_MAILER_REFRESH_TOKEN,
      accessToken: myAccessToken,
    },
  });
  // Email content
  const mailOptions = {
    to: email,
    subject: "Login Link",
    text: `Click the following link to log in: ${loginLink}`,
  };

  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

module.exports = new IndexController();
