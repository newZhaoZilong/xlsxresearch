

console.log(encode_cell({ "r": 0, "c": 0 }));
let Sheet1 = {
    "!rows": [],
    "!cols": [],
    "A1": { "t": "s", "v": "组合收益率(%)" },
    "F1": { "t": "s", "v": "组合收益率分解项(%)" },
    "K1": { "t": "z", "v": "" },
    "A2": { "t": "s", "v": "组合代码" },
    "B2": { "t": "s", "v": "组合名称" },
    "C2": { "t": "s", "v": "单位净值收益率" },
    "D2": { "t": "s", "v": "总净值收益率" },
    "E2": { "t": "s", "v": "误差" },
    "F2": { "t": "s", "v": "资产大类收益率贡献(%)" },
    "I2": { "t": "s", "v": "费用项贡献(%)" },
    "J2": { "t": "s", "v": "其他收入贡献(%)" },
    "K2": { "t": "z", "v": "" },
    "F3": { "t": "s", "v": "股票" },
    "G3": { "t": "s", "v": "债券" },
    "H3": { "t": "s", "v": "基金" },
    "K3": { "t": "z", "v": "" },
    "A4": { "t": "s", "v": "TEST1" },
    "B4": { "t": "s", "v": "组合测试TEST1" },
    "C4": { "t": "s", "v": "0.3172" },
    "D4": { "t": "s", "v": "0.3176" },
    "E4": { "t": "s", "v": "-0.0004" },
    "F4": { "t": "s", "v": "0.4378" },
    "G4": { "t": "s", "v": "0.0785" },
    "H4": { "t": "s", "v": "0.0349" },
    "I4": { "t": "z", "v": "" },
    "J4": { "t": "s", "v": "0.0101" },
    "A5": { "t": "s", "v": "TEST2" },
    "B5": { "t": "s", "v": "组合测试TEST2" },
    "C5": { "t": "s", "v": "0.1835" },
    "D5": { "t": "s", "v": "0.1827" },
    "E5": { "t": "s", "v": "0.0008" },
    "F5": { "t": "z", "v": "" },
    "G5": { "t": "z", "v": "" },
    "H5": { "t": "z", "v": "" },
    "I5": { "t": "z", "v": "" },
    "J5": { "t": "s", "v": "0" },
    "!merges": [{
        "s": { "r": 0, "c": 0 },
        "e": { "r": 0, "c": 4 }
    },
    {
        "s": { "r": 0, "c": 5 },
        "e": { "r": 0, "c": 9 }
    },
    {
        "s": { "r": 1, "c": 0 },
        "e": { "r": 2, "c": 0 }
    },
    {
        "s": { "r": 1, "c": 1 },
        "e": { "r": 2, "c": 1 }
    },
    {
        "s": { "r": 1, "c": 2 },
        "e": { "r": 2, "c": 2 }
    },
    {
        "s": { "r": 1, "c": 3 },
        "e": { "r": 2, "c": 3 }
    },
    {
        "s": { "r": 1, "c": 4 },
        "e": { "r": 2, "c": 4 }
    },
    {
        "s": { "r": 1, "c": 5 },
        "e": { "r": 1, "c": 7 }
    },
    {
        "s": { "r": 1, "c": 8 },
        "e": { "r": 2, "c": 8 }
    },
    {
        "s": { "r": 1, "c": 9 },
        "e": { "r": 2, "c": 9 }
    }],
    "!ref": "A1:K5",
    "!fullref": "A1:K5"
}
/**
 * 首先把列的合并全部算出来
 * 然后把每列的宽度算出来
 * 然后根据每列的宽度计算和合并列的宽度进行比较，选出一个最大的
 */

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
    let list = [];
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
    sheet["!cols"] = list;
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

