let but = document.getElementById("myButton");
but.onclick = function () {
    debugger;
    console.log(XLSX);
    console.log(saveAs);

    // let $table = document.querySelector('.x-table')
    // const wb2 = XLSX.utils.table_to_book($table, { raw: true })

    rebuildSheets(resultData);
    debugger;
    let wb = resultData;
    debugger;
    const wbout = XLSX.write(wb, { bookType: 'xlsx', bookSST: true, type: 'array'})
    debugger;
    saveAs.saveAs(
        new Blob([wbout], { type: 'application/octet-stream' }),
        `zhaoyi.xlsx`
    )
}
function rebuildSheets(data) {
    Object.keys(data.Sheets).forEach((key) => {
        rebuildSheet(data.Sheets[key]);
    });
}

function rebuildSheet(sheet) {
    let merges = sheet["!merges"].filter((location) => {
        return location.s.c !== location.e.c;
    });
    let set = new Set();
    let mergeObj = [];
    merges.forEach((item) => {
        let key = encode_cell(item.s);
        set.add(key);
        mergeObj.push({
            start: item.s.c,
            end: item.e.c,
            width: getWidth(sheet[key].v)
        });
    });
    debugger;
    //算出列数
    let colLen = getLen(sheet["!ref"]);
    let list = sheet["!cols"];
    Object.keys(sheet).forEach((key) => {
        if (key[0] !== '!' && !set.has(key)) {
            // debugger;
            let idx = turnToNum(key);
            let width = getWidth(sheet[key].v);
            if (!list[idx]) {
                list[idx] = {
                    wch: width
                };
            }
            else if (list[idx].wch < width) {
                list[idx].wch = width;
            }
        }

    });
    debugger;
    mergeObj.forEach((item) => {
        let totalWidth = 0;
        for (let i = item.start; i < item.end + 1; i++) {
            totalWidth += list[i].wch;
        }
        if (totalWidth < item.width) {
            let add = parseInt((item.width - totalWidth) / (item.end - item.start + 1));
            for (let i = item.start; i < item.end + 1; i++) {
                list[i].wch += add;
            }
        }
    });
}
function encode_cell(cell) {
    var col = cell.c + 1;
    var s = "";
    for (; col; col = ((col - 1) / 26) | 0) s = String.fromCharCode(((col - 1) % 26) + 65) + s;
    return s + (cell.r + 1);
}
function getWidth(val) {
    if (!val) {
        return 10;
    }
    /*再判断是否为中文*/
    else if (val.toString().charCodeAt(0) > 255) {
        return val.toString().length * 2;
    } else {
        return val.toString().length;
    }
}

function getLen(ref) {
    let arr = ref.split(':');
    let end = turnToNum(arr[1]);
    return end;
}

function turnToNum(str) {
    str = str.replace(/\d+/, '');
    let num = 0;
    for (let i = 0; i < str.length; i++) {
        num += ((str.charCodeAt(i) - 65) + i * 26);
    }
    return num;
}