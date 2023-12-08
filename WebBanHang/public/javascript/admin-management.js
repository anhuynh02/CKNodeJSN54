function toggleSideBar(sidebar, content){    
    $('#btn-toggle-sidebar').click(() => {
        if(sidebar.css('width') == '0px'){
            // Close
            sidebar.css('width', '16%')
            content.css('width', '84%')
            content.css('margin-left', '16%')
            sidebar.children().fadeIn(800)
        }
        else{
            // Open
            sidebar.css('width', '0')
            content.css('width', '100%')
            content.css('margin-left', '0')
            sidebar.children().hide()

        }
    })
    
}

function clickSideBar(){
    let pathName = window.location.pathname,
        tmpPathName = pathName.split('/').slice(0, 3),
        sideBarPathName = tmpPathName.join('/')
        anchor = $(`#sidebar-wrapper > 
        div.list-group.list-group-flush > a[href="${sideBarPathName}"]`)
    anchor.css({'background-color': '#B1D4E0', 'color': '#145DA0'})
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

function askForChangeStatus(){
    let tr = $('#employees-pane tbody > tr')
    console.log(tr.children('td:last-child'))
    tr.children('td:last-child').click(function(evt){
        // or 4
        let currStatus = $(this).siblings('td:nth-child(9)').text()

        let askSpan = $('#changeStatusEmployee .modal-body > span')
        if(currStatus == 'Unlock')
            askSpan.html(`Bạn có muốn <strong style="color:red">khóa</strong> tài khoản`)
        else
            askSpan.html(`Bạn có muốn <strong style="color:green">mở khóa</strong> tài khoản`)
    })
}

function setHref(lengthDefaultUrl, endpoint){
    window.location.href = window.location.pathname.split('/').slice(0, lengthDefaultUrl).join('/') + `${endpoint}`
}

function handleSalesList(indexPane, lengthDefaultUrl){
    let divList = `#${indexPane} .salesList div`
    $(divList + ':nth-child(2)').click(() => setHref(lengthDefaultUrl, '/sales/today'))
    $(divList + ':nth-child(3)').click(() => setHref(lengthDefaultUrl, '/sales/7daysago'))
    $(divList + ':nth-child(4)').click(() => setHref(lengthDefaultUrl, '/sales/thismonth'))

    $(`#${indexPane} .date-picker button`).click(function(evt){
        evt.preventDefault()
        let inputs = $(this).parent().children('input')
        let start = $(inputs).siblings('#from').val()
        let end = $(inputs).siblings('#to').val()
        if(!start || !end) alert('Vui lòng nhập đầy đủ thông tin!!!')
        else setHref(lengthDefaultUrl, `/sales/${start}/${end}`)
    })
}

function formatDayMonthYear(dateString) {
    let date = new Date(dateString)
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    console.log(day, month, year)

    return `${day < 10 ? '0' + day : day}/${month < 10 ? '0' + month : month}/${year}`;
}


function fetchSales(endpoint){
    let pathDefault = window.location.pathname.split('/').slice(0, 4).join('/')
    fetch(`${pathDefault}${endpoint}`)
    .then(res => res.json())
    .then(data => {
        console.log(data)
        $('#employee-detail-pane #numInvoicesEmployee').text(data.numInvoices)
        $('#employee-detail-pane #totalAmountEmployee').text(data.totalAmount)
        $('#employee-detail-pane #numProductsEmployee').text(data.numProducts)
        $('#employee-detail-pane .timeResult').text(data.time)
        $('#employee-detail-pane #listInvoicesEmployee').html(function(){
            let html = ''
            for(let invoice of data.listInvoices){
                html += `
                <tr>
                    <td style="display: none;">${invoice._id}</td>
                    <td>${invoice.totalItems}</td>
                    <td>${invoice.totalAmount}</td>
                    <td>${invoice.givenAmount}</td>
                    <td>${invoice.excessAmount}</td>
                    <td>${invoice.status}</td>
                    <td>${formatDayMonthYear(invoice.createdAt)}</td>
                    <td>${formatDayMonthYear(invoice.purchaseDate)}</td>
                </tr>
                `
            }
            return html
        })

        $(`#employee-detail-pane #listInvoicesEmployee tr td`).click(function(){
            let invoiceId = $(this).siblings().first().text()
            setHref(4, `/sales/${invoiceId}`)
        })
    })
    .catch(err => console.log(err))

}
function handleSalesListEmployeeDetail(){
    let divList = `#employee-detail-pane .salesList div`
    $(divList + ':nth-child(2)').click(() => fetchSales('/sales/today'))
    $(divList + ':nth-child(3)').click(() => fetchSales('/sales/7daysago'))
    $(divList + ':nth-child(4)').click(() => fetchSales('/sales/thismonth'))
    $(`#employee-detail-pane .date-picker button`).click(function(evt){
        evt.preventDefault()
        let inputs = $(this).parent().children('input')
        let start = $(inputs).siblings('#from').val()
        let end = $(inputs).siblings('#to').val()
        if(!start || !end) alert('Vui lòng nhập đầy đủ thông tin!!!')
        else fetchSales(`/sales/${start}/${end}`)
    })
}

function clickToViewDetailEmployee(){
    $(`#employees-pane tbody tr td:not(:last-child)`).click(function(evt){
        let id = $(this).siblings().first().text()
        
        setHref(4, `/${id}`)
    })
}

function clickToViewDetail(indexPane, lengthDefaultUrl){
    $(`#${indexPane} tbody tr td`).click(function(evt){
        let id = $(this).siblings().first().text()
        console.log(indexPane)
        setHref(lengthDefaultUrl, `/${id}`)
    })
}

$(document).ready(function () {
    let sidebarWrapper = $('#sidebar-wrapper')
    let contentWrapper = $('#content-wrapper')
    // let ml = sidebarWrapper.css('width')
    // contentWrapper.css('margin-left', ml)

    toggleSideBar(sidebarWrapper, contentWrapper, 0)
    clickSideBar()
    datePicker()
    askForChangeStatus()

    clickToViewDetail('dashboard-pane', 3)
    clickToViewDetailEmployee()

    handleSalesList('dashboard-pane', 2)
    handleSalesListEmployeeDetail() 
    
})