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
    return `${encodeCell({ r: r1, c: c1 })}:${encodeCell({ r: r2, c: c2 })}`;
}

function getResult({
    headList,
    dataList,
    startR,
    endR,
    startC,
    endC
}) {
    let ref = getRef(startR, startC, endR - 1, endC);
    let Sheet1 = {
        "!rows": [],
        "!cols": [],
        "!merges": [],
        "!ref": ref,
        "!fullref": ref
    };
    let handle = (item) => {
        // debugger;
        let key = encodeCell(item.location);
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

    return {
        "SheetNames": ["Sheet1"],
        "Sheets": {
            "Sheet1": Sheet1
        }
    };
}

function encodeCell(cell) {
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
    for (let i = 0; i < arr.length; i++) {
        let list = arr[i];
        for (let j = 0; j < list.length; j++) {
            let item = list[j];
            callBack(item);
        }
    }
}

function parseToBook(data, column) {
    //根据column重新构建list,生的的list包含创建book的所有数据
    let startR = 0, endR = 0, startC = 0, endC = 0;
    let keys = [];
    let list = rebuildList(column, startC, keys);


    //获取节点的最大高度
    let maxHeight = getMaxHeight(list);
    //将所有节点都调整为最大高度
    adjustList(list, maxHeight, startR);

    endR = startR + list[0].height;
    endC = startC + keys.length;

    //对data进行重构
    let dataList = rebuildData(data, keys, startC, endR);
    endR += dataList.length;

    return getResult({
        headList: list,
        dataList,
        startR,
        startC,
        endR,
        endC
    });
}

module.exports = {
    parseToBook
}