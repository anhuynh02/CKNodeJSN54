const Invocie = require("../models/Invoice")
const InvocieDetail = require("../models/InvoiceDetail")
const Product = require("../models/Product")
const helper = require("../helpers/FormatInfo")
const InvoiceDetail = require("../models/InvoiceDetail")


async function getSalesInRangeAdmin(start, end){
    let invoices = await Invocie.find({
        createdAt: { $gte: start, $lte: end }
    })
    
    let invoiceDetails = await InvocieDetail.find({
        createdAt: { $gte: start, $lte: end }
    })

    let numInvoices = invoices.length
    let numProducts = 0
    let totalAmount = 0
    let listInvoices = []

    for await(let invoice of invoices){
        totalAmount += invoice.totalAmount
        listInvoices.push(invoice.toJSON())
    }

    for await(let invoiceDetail of invoiceDetails){
        numProducts += invoiceDetail.qty
    }

    return {numInvoices, numProducts, totalAmount, listInvoices}
}

async function getSalesInRangeEmployee(start, end, employeeId){
    let invoices = await Invocie.find({
        employeeId,
        createdAt: { $gte: start, $lte: end }
    })

    let numInvoices = invoices.length
    let listInvoices = []
    let numProducts = 0
    let totalAmount = 0
   
    for await(let invoice of invoices){

        totalAmount += invoice.totalAmount
        // Thêm các invoice (do chưa convert về json) vào listInvoice
        listInvoices.push(invoice.toJSON())

        // Các invoices chỉ chứ Array của id invoiceDetails
        let invoiceDetails = invoice.invoiceDetails

        for await(let _id of invoiceDetails){
            let invoiceDetailDoc = await InvocieDetail.findById({_id})
            numProducts += invoiceDetailDoc.qty
        }
    }
    return {numInvoices, numProducts, totalAmount, listInvoices}
}

class salesController {
    async getSalesToday(req, res){
        let start = new Date()
        start.setHours(0, 0, 0, 0)

        let end = new Date()
        end.setHours(23, 59, 59, 999)

        let {numInvoices, numProducts, totalAmount, listInvoices} = await getSalesInRangeAdmin(start, end)

        res.render("admin/dashboard", {
            layout: "admin-layout",
            numInvoices, totalAmount, numProducts, listInvoices,
            time: 'today'
        })
    }

    async getSales7DaysAgo(req, res){
        let start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        let end = new Date()

        let {numInvoices, numProducts, totalAmount, listInvoices} = await getSalesInRangeAdmin(start, end)

        res.render("admin/dashboard", {
            layout: "admin-layout",
            numInvoices, totalAmount, numProducts, listInvoices,
            time: '7 days ago'
        })
        
        
    }

    async getSalesThisMonth(req, res){
        let date = new Date(), y = date.getFullYear(), m = date.getMonth()
        let start = new Date(y, m, 1)
        let end = new Date(y, m + 1, 0)

        let {numInvoices, numProducts, totalAmount, listInvoices} = await getSalesInRangeAdmin(start, end)
        
        res.render("admin/dashboard", {
            layout: "admin-layout",
            numInvoices, totalAmount, numProducts, listInvoices,
            time: 'this month'
        })
    }

    async getSalesInRange(req, res){
        let {start, end} = req.params
        
        let {numInvoices, numProducts, totalAmount, listInvoices} = await getSalesInRangeAdmin(start, end)
       
        res.render("admin/dashboard", {
            layout: "admin-layout",
            numInvoices, totalAmount, numProducts, listInvoices,
            start, end, time: `${helper.formatDate(start)} - ${helper.formatDate(end)}`
        })
    }

    async getSalesTodayEmployee(req, res){
        let employeeId = req.params.empId
        let start = new Date()
        start.setHours(0, 0, 0, 0)
        let end = new Date()
        end.setHours(23, 59, 59, 999)

        let {numInvoices, numProducts, totalAmount, listInvoices} = await getSalesInRangeEmployee(start, end, employeeId)
        res.send({
            numInvoices, totalAmount, numProducts, listInvoices,
            time: 'today'
        })
    }

    async getSales7DaysAgoEmployee(req, res){
        let employeeId = req.params.empId
        let start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        let end = new Date()

        let {numInvoices, numProducts, totalAmount, listInvoices} = await getSalesInRangeEmployee(start, end, employeeId)
        res.send({
            numInvoices, totalAmount, numProducts, listInvoices,
            time: '7 days ago'
        })
    }

    async getSalesThisMonthEmployee(req, res){
        let employeeId = req.params.empId
        let date = new Date(), y = date.getFullYear(), m = date.getMonth()
        let start = new Date(y, m, 1)
        let end = new Date(y, m + 1, 0)

        let {numInvoices, numProducts, totalAmount, listInvoices} = await getSalesInRangeEmployee(start, end, employeeId)
        res.send({
            numInvoices, totalAmount, numProducts, listInvoices,
            time: 'this month'
        })
    }

    async getSalesInRangeEmployee(req, res){
        let employeeId = req.params.empId
        let {start, end} = req.params
        
        let {numInvoices, numProducts, totalAmount, listInvoices} = await getSalesInRangeEmployee(start, end, employeeId)
        
        res.send({
            numInvoices, totalAmount, numProducts, listInvoices,
            start, end, time: `${helper.formatDate(start)} - ${helper.formatDate(end)}`
        })
    }

    async getSalesInvoiceDetails(req, res){
        let invoiceId = req.params.id
        let employeeId = req.params.empId
        let invoiceDetailIds
        
        if(employeeId)
            invoiceDetailIds = (await Invocie.find({_id: invoiceId, employeeId}))[0].invoiceDetails
        else invoiceDetailIds = (await Invocie.find({_id: invoiceId}))[0].invoiceDetails
   
        let listInvoiceDetails = []
        for await(let id of invoiceDetailIds){
            let invoiceDetail = await InvocieDetail.find({_id: id})
            listInvoiceDetails.push(invoiceDetail[0].toJSON())
        }
        console.log(listInvoiceDetails[0].productId)
        res.render('admin/invoice-details', {layout: 'admin-layout', listInvoiceDetails})
    }

    async getSalesInvoiceDetailsInProfile(req, res){
        let invoiceId = req.params.id
        let employeeId = req.params.empId
        let invoiceDetailIds
        
        if(employeeId)
            invoiceDetailIds = (await Invocie.find({_id: invoiceId, employeeId}))[0].invoiceDetails
        else invoiceDetailIds = (await Invocie.find({_id: invoiceId}))[0].invoiceDetails
   
        let listInvoiceDetails = []
        for await(let id of invoiceDetailIds){
            let invoiceDetail = await InvocieDetail.find({_id: id})
            listInvoiceDetails.push(invoiceDetail[0].toJSON())
        }
        console.log(listInvoiceDetails[0].productId)
        res.render('admin/invoice-details', {listInvoiceDetails})
    }
}
module.exports = new salesController