var Product = require("../models/Product");
var InvoiceDetail = require("../models/InvoiceDetail");
const multiparty = require("multiparty");
var bcrypt = require("bcrypt");
var { body, validationResult } = require("express-validator");


class ProductController {
    GetProduct(req, res) {

        Product.find({ status: 1 }).lean().then((data) => {
            console.log(data)
            return res.render("admin/product", { layout: "admin-layout", result: data });
        });
    }

    GetOneProduct(req, res) {
        Product.find({ _id: req.body._id }).lean().then((data) => {
            return res.render("admin/product", { layout: "admin-layout", result: data });
        });

    }

    async PostAddProduct(req, res) {
        console.log(req.body);
        await body("barcode")
            .notEmpty()
            .withMessage("Vui lòng nhập barcode")
            .isInt({ min: 0 })
            .withMessage("Vui lòng nhập số lớn hơn 0")
            .trim()
            .escape()
            .run(req);

        await body("name")
            .notEmpty()
            .withMessage("Vui lòng nhập tên")
            .trim()
            .escape()
            .run(req);

        // await body("image")
        //     .notEmpty()
        //     .withMessage("Vui lòng chọn file")
        //     .trim()
        //     .escape()
        //     .run(req);

        await body("iPrice")
            .notEmpty()
            .withMessage("Vui lòng nhập giá tiền")
            .isInt({ min: 0 })
            .withMessage("Vui lòng nhập số lớn hơn 0")
            .trim()
            .escape()
            .run(req);

        await body("price")
            .notEmpty()
            .withMessage("Vui lòng nhập giá tiền")
            .isInt({ min: 0 })
            .withMessage("Vui lòng nhập số lớn hơn 0")
            .trim()
            .escape()
            .run(req);

        await body("desc")
            .notEmpty()
            .withMessage("Vui lòng nhập giá tiền")
            .trim()
            .escape()
            .run(req);

        await body("category")
            .notEmpty()
            .withMessage("Vui lòng nhập loại sản phẩm")
            .trim()
            .escape()
            .run(req);

        await body("amount")
            .notEmpty()
            .withMessage("Vui lòng nhập giá tiền")
            .isInt({ min: 0 })
            .withMessage("Vui lòng nhập số lớn hơn 0")
            .trim()
            .escape()
            .run(req);

        const errors = validationResult(req);
        let { barcodeErr, nameErr, imageErr, iPriceErr, priceErr, descErr, categoryErr, amountErr } = "";
        if (!errors.isEmpty()) {
            errors.array().forEach((err) => {
                switch (err.path) {
                    case "barcode":
                        console.log("1");
                        barcodeErr = err.msg;
                        break;
                    case "name":
                        console.log("2");
                        nameErr = err.msg;
                        break;
                    // case "image":
                    //     console.log("0");
                    //     imageErr = err.msg;
                    //     break;
                    case "iPrice":
                        console.log("3");
                        iPriceErr = err.msg;
                        break;
                    case "price":
                        console.log("4");
                        priceErr = err.msg;
                        break;
                    case "desc":
                        console.log("5");
                        descErr = err.msg;
                        break;
                    case "category":
                        console.log("6");
                        categoryErr = err.msg;
                        break;
                    case "amount":
                        console.log("7");
                        amountErr = err.msg;
                        break;
                }
            });
            return res.status(400).json({
                success: false,
                body: req.body,
                barcodeErr: barcodeErr,
                nameErr: nameErr,
                // imageErr: imageErr,
                iPriceErr: iPriceErr,
                priceErr: priceErr,
                descErr: descErr,
                categoryErr: categoryErr,
                amountErr: amountErr,

            });
        } else {
            try {
                console.log(req.body)
                const newProduct = new Product({
                    barcode: req.body.barcode,
                    name: req.body.name,
                    iPrice: req.body.iPrice,
                    price: req.body.price,
                    desc: req.body.desc,
                    img: "product.png",
                    category: req.body.category,
                    amount: req.body.amount || 1000
                });

                await newProduct.save();

                return res.status(200).json({ success: true });
            } catch (err) {
                console.log(err);
                return res
                    .status(500)
                    .json({ success: false, message: "Add product failed" });
            }
        }
    }

    PostGetProductInfo(req, res) {
        console.log('received product info');
        console.log(req.body.id);
        Product.findById(req.body.id)
            .then((product) => {
                if (!product) {
                    return res.status(404).json({
                        success: false,
                        message: "Không tìm thấy product",
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
                    message: "Internal server error: " + error.message,
                });
            });
    }

    async PutUpdateProduct(req, res) {
        console.log(req.body);
        await body("barcode")
            .notEmpty()
            .withMessage("Vui lòng nhập barcode")
            .isInt({ min: 0 })
            .withMessage("Vui lòng nhập số lớn hơn 0")
            .trim()
            .escape()
            .run(req);

        await body("name")
            .notEmpty()
            .withMessage("Vui lòng nhập tên")
            .trim()
            .escape()
            .run(req);

        await body("iPrice")
            .notEmpty()
            .withMessage("Vui lòng nhập giá tiền")
            .isInt({ min: 0 })
            .withMessage("Vui lòng nhập số lớn hơn 0")
            .trim()
            .escape()
            .run(req);

        await body("price")
            .notEmpty()
            .withMessage("Vui lòng nhập giá tiền")
            .isInt({ min: 0 })
            .withMessage("Vui lòng nhập số lớn hơn 0")
            .trim()
            .escape()
            .run(req);

        await body("desc")
            .notEmpty()
            .withMessage("Vui lòng nhập giá tiền")
            .trim()
            .escape()
            .run(req);

        await body("category")
            .notEmpty()
            .withMessage("Vui lòng nhập loại sản phẩm")
            .trim()
            .escape()
            .run(req);

        await body("amount")
            .notEmpty()
            .withMessage("Vui lòng nhập số lượng")
            .isInt({ min: 0 })
            .withMessage("Vui lòng nhập số lớn hơn 0")
            .trim()
            .escape()
            .run(req);

        const errors = validationResult(req);
        let { barcodeErr, nameErr, iPriceErr, priceErr, descErr, categoryErr, amountErr } = "";
        if (!errors.isEmpty()) {
            errors.array().forEach((err) => {
                switch (err.path) {
                    case "barcode":
                        barcodeErr = err.msg;
                        break;
                    case "name":
                        nameErr = err.msg;
                        break;
                    case "iPrice":
                        iPriceErr = err.msg;
                        break;
                    case "price":
                        priceErr = err.msg;
                        break;
                    case "desc":
                        descErr = err.msg;
                        break;
                    case "category":
                        categoryErr = err.msg;
                        break;
                    case "amount":
                        amountErr = err.msg;
                        break;

                }
            });
            return res.status(400).json({
                success: false,
                body: req.body,
                barcodeErr: barcodeErr,
                nameErr: nameErr,
                iPriceErr: iPriceErr,
                priceErr: priceErr,
                descErr: descErr,
                categoryErr: categoryErr,
                amountErr: amountErr,

            });
        } else {
            console.log(req.body)
            Product.findOneAndUpdate(
                { _id: req.body.id },
                {
                    barcode: req.body.barcode,
                    name: req.body.name,
                    iPrice: req.body.iPrice,
                    price: req.body.price,
                    desc: req.body.desc,
                    category: req.body.category,
                    amount: req.body.amount
                }
            )
                .then((product) => {
                    if (!product) {
                        return res.status(404).json({
                            success: false,
                            message: "Không tìm thấy sản phẩm",
                        });
                    } else {
                        return res.status(200).json({
                            success: true,
                            message: "Update success",
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
    }

    async postDeleteProduct(req, res) {
        InvoiceDetail.findOne({ productId: req.body.id }).then((data) => {
            console.log(data);
            if (data) {
                return res.status(404).json({
                    success: false,
                    message: "Dữ liệu này có tồn tại trong Invoice Details",
                });
            } else {
                Product.findOneAndDelete({ _id: req.body.id }).then((data) => {
                    if (!data) {
                        return res.status(404).json({
                            success: false,
                            message: "Không tìm thấy user",
                        });
                    } else {
                        return res.status(200).json({
                            success: true,
                            message: "Delete success",
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
        });
        try {

        } catch (err) {
            console.log(err);
        }
    }
}
module.exports = new ProductController
