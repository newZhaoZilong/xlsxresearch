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

const utils = require("./xlsxUtil.js");
let { parseToBook } = utils;
let book = parseToBook(data, column);
console.log(JSON.stringify(book));

