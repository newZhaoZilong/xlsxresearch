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

function rebuildList(list, y) {
    let newList = [];
    let width = 0;
    for (let i = 0; i < list.length; i++) {
        let item = list[i];
        item.y = width + y;
        let tree = rebuildTree(item);
        width += tree.colspan;
        newList.push(tree);
    }



    // let maxHeight;
    // newList.forEach((item)=>{
    //     maxHeight = getHeight(item);
    // });




    return newList;
}

// function Tree({
//     label,
//     prop,
//     columns
// }){
//     this.value = prop;
//     this.children = colu
// }

function rebuildTree({
    label,
    prop,
    columns,
    y
}) {
    let location = { y };
    let value = label;
    let children = columns ? rebuildList(columns, y) : [];

    let height = 0;
    if (children.length) {
        //获取子节点的最大深度
        children.forEach((child) => {
            if (child.height > height) {
                height = child.height;
            }
        });
    }

    height++;

    let colspan = children.reduce((x, item) => {
        return x + item.colspan;
    }, 0) || 1;
    // let tree = new Tree(data);
    let tree = {
        value,
        children,
        colspan,
        location,
        height,
        rowspan: 1
    };
    // adjust(tree, height);
    return tree;
}
debugger;
let list = rebuildList(column, 0);
debugger;
let maxHeight = getMaxHeight(list);
adjustList(list, maxHeight);
console.log(JSON.stringify(list));
debugger;
function getMaxHeight(list) {
    let max = 0;
    list.forEach((item) => {
        if (max < item.height) {
            max = item.height;
        }
    });
    return max;
}
function adjustList(list, height) {
    list.forEach((item) => {
        adjust(item, height);
    });
}
function adjust(tree, height) {
    let children = tree.children;
    if (children.length === 0) {
        tree.rowspan = height;
        tree.height = height;
    } else {
        adjustList(children, height - tree.rowspan);
    }
}

// function adjust(tree,height){

// }