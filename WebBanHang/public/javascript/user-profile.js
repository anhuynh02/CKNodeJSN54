function setHref(lengthDefaultUrl, endpoint){
    window.location.href = window.location.pathname.split('/').slice(0, lengthDefaultUrl).join('/') + `${endpoint}`
}

function datePicker(){ 
    let datePicker = $('.date-picker')    
        from = datePicker.children('#from')
        to = datePicker.children('#to')

    to.prop('disabled', true).css('cursor', 'not-allowed')

    from.on('change', function() {
        if(from.val()){
            to.prop('disabled', false).css('cursor', 'default')
            to.attr('min', from.val())
        }
    })
}

function fetchSales(lengthDefaultUrl, endpoint){
    let pathDefault = window.location.pathname.split('/').slice(0, lengthDefaultUrl).join('/')
    fetch(`${pathDefault}${endpoint}`)
    .then(res => res.json())
    .then(data => {
        console.log(data)
        $('#numInvoicesEmployee').text(data.numInvoices)
        $('#totalAmountEmployee').text(data.totalAmount)
        $('#numProductsEmployee').text(data.numProducts)
        $('.timeResult').text(data.time)
        $('#listInvoicesEmployee').html(function(){
            let html = ''
            for(let invoice of data.listInvoices){
                console.log(invoice)
                html += `
                <tr>
                    <td style="display: none;">${invoice._id}</td>
                    <td>${invoice.totalItems}</td>
                    <td>${invoice.totalAmount}</td>
                    <td>${invoice.givenAmount}</td>
                    <td>${invoice.excessAmount}</td>
                    <td>${invoice.status}</td>
                    <td>${formatDate(invoice.createdAt)}</td>
                    <td>${formatDate(invoice.purchaseDate)}</td>
                </tr>
                `
            }
            return html
        })
        let userId = $('#userId').text()
        $(`#listInvoicesEmployee tr td`).click(function(){
            let invoiceId = $(this).siblings().first().text()
            setHref(3, `/${userId}/sales/${invoiceId}`)
        })
    })
    .catch(err => console.log(err))

}

function handleSalesListEmployeeDetail(){
    let divList = `.salesList div`
    let userId = $('#userId').text()
    $(divList + ':nth-child(2)').click(() => fetchSales(2, `/${userId}/sales/today`))
    $(divList + ':nth-child(3)').click(() => fetchSales(2, `/${userId}/sales/7daysago`))
    $(divList + ':nth-child(4)').click(() => fetchSales(2, `/${userId}/sales/thismonth`))
    $(`.date-picker button`).click(function(evt){
        evt.preventDefault()
        let inputs = $(this).parent().children('input')
        let start = $(inputs).siblings('#from').val()
        let end = $(inputs).siblings('#to').val()
        if(!start || !end) alert('Vui lòng nhập đầy đủ thông tin!!!')
        else fetchSales(2, `/${userId}/sales/${start}/${end}`)
    })
}

$(document).ready(function(){
    handleSalesListEmployeeDetail()
    datePicker()
    // console.log($('.salesList div:nth-child(2)'))
})