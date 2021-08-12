let data = [{
    "10530": "0.004378013610058",
    "10531": "0.0007846497880951",
    "10533": "0.0003490661101542",
    "gbPUnitNavRtn": "0.0031716885068023",
    "pName": "组合测试TEST1",
    "portCode": "TEST1",
    "egbPNavRtnD": "-0.0000042822273595",
    "gbPTotalNavRtnOpen": "0.0031759707341618",
    "assetRtnAttribution": "0.003075297915882",
    "feeRtnAttribution": "0",
    "otherRtnAttribution": "0.0001006728182798"
},
{
    "gbPUnitNavRtn": "0.0018348623853211",
    "pName": "组合测试TEST2",
    "portCode": "TEST2",
    "egbPNavRtnD": "0.0000078778139815",
    "gbPTotalNavRtnOpen": "0.0018269845713396",
    "assetRtnAttribution": "0.0018269845713396",
    "feeRtnAttribution": "0",
    "otherRtnAttribution": "0"
}];
let column = [
    {
        "label": "组合收益率(%)",
        "prop": "",
        "columns": [
            { "label": "组合代码", "prop": "portCode" },
            { "label": "组合名称", "prop": "pName" },
            { "label": "单位净值收益率", "align": "right", "prop": "gbPUnitNavRtn" },
            { "label": "总净值收益率", "align": "right", "prop": "gbPTotalNavRtnOpen" },
            { "label": "误差", "align": "right", "prop": "egbPNavRtnD" }]
    },
    {
        "label": "组合收益率分解项(%)", "prop": "",
        "columns": [
            {
                "label": "资产大类收益率贡献(%)",
                "prop": "",
                "columns": [
                    { "label": "股票", "align": "right", "prop": "10530" },
                    { "label": "债券", "align": "right", "prop": "10531" },
                    { "label": "基金", "align": "right", "prop": "10533" }]
            },
            { "label": "费用项贡献(%)", "prop": "", "columns": [] },
            { "label": "其他收入贡献(%)", "align": "right", "prop": "otherRtnAttribution" }]
    }];
/**
* 创建一个树结构，节点的数据结构为
* interface Tree{
*   location:{x:number,y:number},//坐标,就是左上角位置
*   colspan:number,//占用列数，等于子节点占用列数之和
*   rowspan:number,//占用行数, 通过比较兄弟节点的深度，进行调整
    height:number,//树的深度,同一个父节点的子节点的深度必须相同,子节点为0，深度为1
*   value:String,//值
*   children:Array<Tree>,//子节点
* }
*/
//y表示列数开始位置
function rebuildList(list, c, keys) {
    let newList = [];
    let width = 0;
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        item.c = width + c;//计算当前单元格所在列数
        let tree = rebuildTree(item, keys);
        width += tree.colspan;
        newList.push(tree);
    }
    return newList;
}

function rebuildTree({
    label,
    prop,
    columns,
    c
}, keys) {
    let location = { c };
    let value = label;
    let children, colspan;
    if (!columns || columns.length === 0) {
        children = [];
        colspan = 1;
        keys.push(prop);
    } else {
        children = rebuildList(columns, c, keys);
        //节点包含的列数等于所有子节点的列数和
        colspan = children.reduce((sum, item) => {
            return sum + item.colspan;
        }, 0);
    }

    //计算当前树的高度，等于子树的最大高度+1
    let height = getMaxHeight(children);
    height++;

    let tree = {
        value,//单元格内容
        children,//子树
        location,//单元格位置
        height,//当前树的深度
        colspan,//单元格包含列数
        rowspan: 1//单元格包含行数
    };
    return tree;
}

//根据column重新构建list,生的的list包含创建book的所有数据
let startR = 0, endR = 0, startC = 0, endC = 0;
let keys = [];
let list = rebuildList(column, 0, keys);

debugger;
//获取节点的最大高度
let maxHeight = getMaxHeight(list);
//将所有节点都调整为最大高度
adjustList(list, maxHeight, 0);
debugger;
endR = startR + list[0].height;
endC = startC + keys.length;

//对data进行重构
let dataList = rebuildData(data, keys, startC, endR);
endR += dataList.length;

let resultBook2 = getResult({
    headList: list,
    dataList,
    startR,
    startC,
    endR,
    endC
});
debugger;


//获取节点的最大高度
function getMaxHeight(list) {
    let max = 0;
    list.forEach((item) => {
        if (max < item.height) {
            max = item.height;
        }
    });
    return max;
}
/**
 * 当前函数用于设置节点的行数和节点包含行的数量
 * @param {*} list 节点数组
 * @param {*} height 应该将当前节点调整到的高度
 * @param {*} x 当前节点的行数
 */
function adjustList(list, height, r) {
    list.forEach((item) => {
        adjust(item, height, r);
    });
}

function adjust(tree, height, r) {
    tree.location.r = r;
    tree.height = height;
    let children = tree.children;
    if (children.length === 0) {
        tree.rowspan = height;
    } else {
        adjustList(children, height - tree.rowspan, r + tree.rowspan);
    }
}


function rebuildData(data, keys, startC, startR) {
    let colspan = 1, rowspan = 1;
    return data.map((item, row) => {
        return keys.map((key, col) => {
            let value = item[key];
            let location = {
                c: startC + col * colspan,
                r: startR + row * rowspan,
            }
            return {
                value,//单元格内容
                location,//单元格位置
                colspan,//单元格包含列数
                rowspan//单元格包含行数
            }
        });
    });
}

function getRef(r1, c1, r2, c2) {
    return `${encode_cell({ r: r1, c: c1 })}:${encode_cell({ r: r2, c: c2 })}`;
}

function getResult({
    headList,
    dataList,
    startR,
    endR,
    startC,
    endC
}) {
    debugger;
    let ref = getRef(startR, startC, endR - 1, endC);
    let Sheet1 = {
        "!rows": [],
        "!cols": [],
        "!merges": [],
        "!ref": ref,
        "!fullref": ref
    };
    debugger;
    let handle = (item) => {
        // debugger;
        let key = encode_cell(item.location);
        let { value, colspan, rowspan, location } = item;
        Sheet1[key] = {
            t: value ? 's' : 'z',
            v: value
        }
        if (rowspan > 1 || colspan > 1) {
            Sheet1["!merges"].push({
                "s": location,
                "e": { "r": location.r + rowspan - 1, "c": location.c + colspan - 1 }
            });
        }
    };


    printTree(headList, handle);

    printArr(dataList, handle);


    debugger;
    return {
        "SheetNames": ["Sheet1"],
        "Sheets": {
            "Sheet1": Sheet1
        }
    };
}

function encode_cell(cell) {
    var col = cell.c + 1;
    var s = "";
    for (; col; col = ((col - 1) / 26) | 0) s = String.fromCharCode(((col - 1) % 26) + 65) + s;
    return s + (cell.r + 1);
}

function printTree(list, callBack) {
    list.forEach((tree) => {
        callBack(tree);
        printTree(tree.children, callBack);
    });
}

function printArr(arr, callBack) {
    debugger;
    for (let i = 0; i < arr.length; i++) {
        let list = arr[i];
        for (let j = 0; j < list.length; j++) {
            let item = list[j];
            callBack(item);
        }
    }
}