var Product = require("../models/Product");

class ProductController {
    getProducts(req, res) {
        try {
            Product.find({}).then((data) => {
                console.log(data);
            });
        } catch (err) {
            console.log(err);
        }
    }
    addProducts(req, res) {//temporary
        try {
            const add = new Product({
                name: "Samsung",
                price: 10000,
                desc: "Samsung",
                img: "samsung.jpg",
                amount: 10,
            })
            add.save();
        } catch (err) {
            console.log(err);
        }
    }
    deleteProducts(req, res) {
        try {
            Product.find({}).then((data) => {
                console.log(data);
            });
        } catch (err) {
            console.log(err);
        }
    }
}
module.exports = new ProductController
