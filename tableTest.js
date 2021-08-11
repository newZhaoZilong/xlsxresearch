let but = document.getElementById("myButton");
but.onclick = function () {
    debugger;
    console.log(XLSX);
    console.log(saveAs);

    // let $table = document.querySelector('.x-table')
    // const wb = XLSX.utils.table_to_book($table, { raw: true })
    // wb.Sheets["Sheet1"]['!cols'] = 50;
    let val = "我撒旦范德萨发生士大夫士大夫石帆胜丰的";
    let getLength = val => {
        /*先判断是否为null/undefined*/
        if (val == null) {
            return 10
        }
        /*再判断是否为中文*/
        else if (val.toString().charCodeAt(0) > 255) {
            return val.toString().length * 2
           
        } else {
            return val.toString().length
        }
    }
    // let wb = {
    //     SheetNames:["shan"],
    //     Sheets:{
    //         shan:{
    //             "!ref":"A1:A1",
    //             "!cols":[{
    //                 wch:getLength(val)
    //             }],
    //             A1:{
    //                 t:'s',
    //                 v:val
    //             }
    //         }
    //     }
    // };
    let wb = data;
    debugger;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array' })
    debugger;
    saveAs.saveAs(
        new Blob([wbout], { type: 'application/octet-stream' }),
        `zhaoyi.xlsx`
    )
}