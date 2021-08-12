import XLSX from "xlsx";
var workbook = XLSX.readFile('zhaoyi.xlsx',{cellStyles:true});
debugger;
console.log("haha");

XLSX.writeFile(workbook, 'out.xlsx',{cellStyles:true});
