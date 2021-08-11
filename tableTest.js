let but = document.getElementById("myButton");
but.onclick = function () {
    debugger;
    console.log(XLSX);
    console.log(saveAs);
    
    let $table = document.querySelector('.x-table')
    const wb = XLSX.utils.table_to_book($table, { raw: true })
    debugger;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
    
    saveAs.saveAs(
        new Blob([wbout], { type: 'application/octet-stream' }),
        `zhaoyi.xlsx`
    )
}