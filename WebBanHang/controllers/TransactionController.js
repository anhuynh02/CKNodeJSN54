const Customer = require("../models/Customer");
const Product = require("../models/Product");
const Invoice = require("../models/Invoice");
const InvoiceDetail = require("../models/InvoiceDetail");
var { body, validationResult } = require("express-validator");
const validator = require("validator");
const { Mongoose } = require("mongoose");
class TransactionController {
  GetCustomer(req, res) {
    if (!req.body.phone) {
      return res.status(401).json({
        success: false,
        err: "Fill all blank",
      });
    }
    Customer.find({ phone: req.body.phone })
      .then((customer) => {
        if (customer.length == 0) {
          return res.status(404).json({
            success: false,
          });
        } else {
          return res.status(200).json({
            success: true,
            Customer: customer,
          });
        }
      })
      .catch((err) => {
        return res.status(500).json({
          success: false,
          err: err,
        });
      });
  }
  async PostAddCustomer(req, res) {
    await body("phone")
      .notEmpty()
      .withMessage("Vui lòng nhập số điện thoại")
      .trim()
      .escape()
      .run(req);
    await body("name")
      .notEmpty()
      .withMessage("Vui lòng nhập tên")
      .trim()
      .escape()
      .run(req);
    await body("address")
      .notEmpty()
      .withMessage("Vui lòng nhập địa chỉ")
      .trim()
      .escape()
      .run(req);

    // Check for validation errors
    const errors = validationResult(req);
    let { phoneErr, nameErr, addressErr } = "";
    if (!errors.isEmpty()) {
      errors.array().forEach((err) => {
        console.log(err);
        switch (err.path) {
          case "name":
            nameErr = err.msg;
            break;
          case "address":
            addressErr = err.msg;
            break;
          case "address":
            phoneErr = err.msg;
            break;
        }
      });
      console.log({ nameErr, addressErr });
      return res.status(400).json({
        success: false,
        nameErr: nameErr,
        addressErr: addressErr,
      });
    }

    Customer.create({
      name: req.body.name,
      phone: req.body.phone,
      address: req.body.address,
    })
      .then((customer) => {
        return res.status(200).json({
          success: true,
          Customer: customer, // Changed from User to Customer
        });
      })
      .catch((err) => {
        return res.status(500).json({
          success: false,
          err: err,
        });
      });
  }

  PostGetProduct(req, res) {
    Product.find({ name: { $regex: req.body.name, $options: "i" } })
      .then((product) => {
        if (product.length == 0) {
          return res.status(404).json({
            success: false,
            message: "Cannot found any product",
          });
        } else {
          return res.status(200).json({
            success: true,
            Product: product,
          });
        }
      })
      .catch((err) => {
        return res.status(500).json({
          success: false,
          message: "Server Error",
        });
      });
  }

  PostAddNewInvoice(req, res) {
    Invoice.findOne({ status: 1 })
      .then((invoice) => {
        if (!invoice) {
          const newInvoice = new Invoice({
            totalItems: 0,
            totalAmount: 0,
            givenAmount: 0,
            excessAmount: 0,
            purchaseDate: new Date(),
            status: 1,
          });
          return newInvoice.save();
        } else {
          return invoice; // Return the existing invoice
        }
      })
      .then((invoice) => {
        return res.status(200).json({
          success: true,
          message: "Invoice created or retrieved successfully",
          Invoice: invoice,
        });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "Server Error",
        });
      });
  }

  PostAddInvoiceDetail = (req, res) => {
    const { invoiceId, productId } = req.body;

    let flag = false;
    Invoice.findById(invoiceId)
      .then((invoice) => {
        if (!invoice) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy Invoice",
          });
        }

        const promiseArray = [];

        for (const invoiceDetailId of invoice.invoiceDetails) {
          const promise = InvoiceDetail.findOneAndUpdate(
            { _id: invoiceDetailId, productId: productId },
            { $inc: { qty: 1 } },
            { new: true }
          ).then((item) => {
            if (item) {
              flag = true;
            }
          });

          promiseArray.push(promise);
        }

        return Promise.all(promiseArray).then(() => {
          if (!flag) {
            return Product.findById(productId).then((product) => {
              const newInvoiceDetail = new InvoiceDetail({
                productId: product._id,
                price: product.price,
                qty: 1,
                createdAt: new Date(),
                status: 1,
              });

              return newInvoiceDetail.save().then((savedInvoiceDetail) => {
                return Invoice.findByIdAndUpdate(
                  invoiceId,
                  {
                    $push: { invoiceDetails: savedInvoiceDetail._id },
                  },
                  { new: true }
                );
              });
            });
          }
        });
      })
      .then((updatedInvoice) => {
        Invoice.findById(invoiceId).then((invoice) => {
          return res.status(200).json({
            success: true,
            message: flag
              ? "InvoiceDetail đã tồn tại và đã được cập nhật"
              : "InvoiceDetail đã được thêm",
            invoice: invoice,
          });
        });
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "Server Error",
        });
      });
  };
  PostGetInvoiceDetail(req, res) {
    InvoiceDetail.findById(req.body.invoiceDetailId)
      .then((invoiceDetail) => {
        if (!invoiceDetail) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy Invoice Detail",
          });
        } else {
          return res.status(200).json({
            success: true,
            invoiceDetail: invoiceDetail,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "Server Error",
        });
      });
  }

  PostGetProductFromInvoiceDetail(req, res) {
    Product.findById(req.body.productId)
      .then((product) => {
        if (!product) {
          return res.status(404).json({
            success: false,
            message: "Không tìm thấy Sản Phẩm",
          });
        } else {
          return res.status(200).json({
            success: true,
            product: product,
          });
        }
      })
      .catch((error) => {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "Server Error",
        });
      });
  }
  PutUpdateQty(req, res) {
    InvoiceDetail.findByIdAndUpdate(req.body.invoiceDetailId, {
      qty: req.body.qty,
    })
      .then((invoiceDetail) => {
        if (!invoiceDetail) {
          return res.status(404).json({
            success: true,
            message: "Không tìm thấy hóa đơn chi tiết",
          });
        }

        return Invoice.findOne({ invoiceDetails: invoiceDetail._id });
      })
      .then((invoice) => {
        if (!invoice) {
          return res.status(404).json({
            success: true,
            message: "Không tìm thấy hóa đơn",
          });
        }

        return res.status(200).json({
          success: true,
          message: "Cập nhật số lượng thành công",
          invoice: invoice,
        });
      })
      .catch((err) => {
        // Xử lý lỗi ở đây nếu cần thiết
        console.error("Error:", err);
        return res.status(500).json({
          success: false,
          message: "Server Error",
        });
      });
  }
  async PostPayment(req, res) {
    try {
      await body("customerId")
        .notEmpty()
        .withMessage("Chưa có thông tin khách hàng")
        .trim()
        .escape()
        .run(req);

      await body("givenAmount")
        .notEmpty()
        .withMessage("Vui lòng nhập số tiền")
        .trim()
        .escape()
        .custom((value) => {
          if (!validator.isNumeric(value)) {
            throw new Error("Vui lòng nhập một số");
          }
          return true;
        })
        .run(req);

      const errors = validationResult(req) || "";
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((err) => ({
          field: err.path,
          message: err.msg,
        }));

        return res.status(400).json({
          success: false,
          errors: errorMessages,
        });
      }

      const { totalAmount, invoiceDetails } = await calculateTotalAmount(
        req.body.invoiceId
      );
      const excessAmount = req.body.givenAmount - totalAmount;

      if (excessAmount < 0) {
        return res.status(400).json({
          success: false,
          message: "Không đủ số dư để thanh toán",
        });
      }

      const invoice = await Invoice.findByIdAndUpdate(req.body.invoiceId, {
        totalItems: invoiceDetails.length,
        totalAmount: totalAmount,
        givenAmount: req.body.givenAmount,
        excessAmount: excessAmount,
        purchaseDate: new Date(),
        status: 0,
        employeeId: req.session.userId
      });

      if (!invoice) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy hóa đơn",
        });
      }

      const customer = await Customer.findByIdAndUpdate(
        req.body.customerId,
        {
          $push: { invoices: invoice._id },
        },
        { new: true }
      );

      if (!customer) {
        return res.status(404).json({
          success: false,
          message: "Không tìm thấy user",
        });
      }

      res.status(200).json({
        success: true,
        invoice: invoice,
        message: "Thanh toán thành công",
      });
    } catch (error) {
      console.error("Error processing payment:", error);
      res.status(500).json({
        success: false,
        message: "Lỗi trong quá trình thanh toán",
      });
    }
  }
  // Sử dụng hàm removeInvoiceDetail trong PutDeleteInvoiceDetail
  PutDeleteInvoiceDetail(req, res) {
    let invoiceId = req.body.invoiceId;
    let detailId = req.body.invoiceDetailId;

    removeFromInvoiceDetails(invoiceId, detailId)
      .then(() => {
        return updateInvoiceDetailsInInvoice(invoiceId, detailId);
      })
      .then((updatedInvoice) => {
        res.status(200).json({
          success: true,
          invoice: updatedInvoice,
        });
      })
      .catch((error) => {
        res.status(404).json(error);
      });
  }
}
async function calculateTotalAmount(invoiceId) {
  try {
    // Find the invoice by its ID
    const invoice = await Invoice.findOne({ _id: invoiceId, status: 1 });

    if (!invoice) {
      console.log("Invoice not found");
      throw new Error("Invoice not found");
    }

    // Fetch the related invoiceDetails for the given invoice
    const invoiceDetails = await InvoiceDetail.find({
      _id: { $in: invoice.invoiceDetails },
    });

    // Use map to create an array of promises for updating each product
    const updatePromises = invoiceDetails.map((detail) => {
      console.log(typeof(detail.qty))
      Product.findById(detail.productId).then(product=>{
        product.amount -= detail.qty
        return product.save()
      }
      );
    });

    // Wait for all product updates to complete
    await Promise.all(updatePromises);

    // Calculate the total amount by summing up the amounts for each invoice detail
    const totalAmount = invoiceDetails.reduce((total, detail) => {
      return total + detail.qty * detail.price;
    }, 0);

    return { totalAmount, invoiceDetails };
  } catch (error) {
    console.error("Error calculating total amount:", error);
    throw error;
  }
}
const removeFromInvoiceDetails = (invoiceId, detailId) => {
  return new Promise((resolve, reject) => {
    InvoiceDetail.findByIdAndDelete(detailId)
      .then((removedDetail) => {
        if (!removedDetail) {
          reject({
            success: false,
            message: "Không tìm thấy hóa đơn chi tiết",
          });
        } else {
          resolve();
        }
      })
      .catch((error) => {
        reject({
          success: false,
          message: "Lỗi khi xóa hóa đơn chi tiết",
          error: error.message || error,
        });
      });
  });
};

const updateInvoiceDetailsInInvoice = (invoiceId, detailId) => {
  console.log(invoiceId, detailId)
  return new Promise((resolve, reject) => {
    Invoice.findByIdAndUpdate(
      invoiceId,
      { $pull: { invoiceDetails: detailId } },
      { new: true }
    )
      .then((updatedInvoice) => {
        if (!updatedInvoice) {
          reject({
            success: false,
            message: "Không tìm thấy hóa đơn",
          });
        } else {
          resolve(updatedInvoice);
        }
      })
      .catch((error) => {
        reject({
          success: false,
          message: "Lỗi khi cập nhật hóa đơn",
          error: error.message || error,
        });
      });
  });
};

module.exports = new TransactionController();
