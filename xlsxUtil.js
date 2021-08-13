
function rebuildList (list, c, keys) {
    const newList = []
    let width = 0
    for (let i = 0; i < list.length; i++) {
      const item = list[i]
      item.c = width + c// 计算当前单元格所在列数
      const tree = rebuildTree(item, keys)
      width += tree.colspan
      newList.push(tree)
    }
    return newList
  }
  
  function rebuildTree ({
    label,
    prop,
    columns,
    c
  }, keys) {
    const location = { c }
    const value = label
    let children, colspan
    if (!columns || columns.length === 0) {
      children = []
      colspan = 1
      keys.push(prop)
    } else {
      children = rebuildList(columns, c, keys)
      // 节点包含的列数等于所有子节点的列数和
      colspan = children.reduce((sum, item) => {
        return sum + item.colspan
      }, 0)
    }
  
    // 计算当前树的高度，等于子树的最大高度+1
    let height = getMaxHeight(children)
    height++
  
    const tree = {
      value, // 单元格内容
      children, // 子树
      location, // 单元格位置
      height, // 当前树的深度
      colspan, // 单元格包含列数
      rowspan: 1// 单元格包含行数
    }
    return tree
  }
  
  // 获取节点的最大高度
  function getMaxHeight (list) {
    let max = 0
    list.forEach((item) => {
      if (max < item.height) {
        max = item.height
      }
    })
    return max
  }
  /**
   * 当前函数用于设置节点的行数和节点包含行的数量
   * @param {*} list 节点数组
   * @param {*} height 应该将当前节点调整到的高度
   * @param {*} x 当前节点的行数
   */
  function adjustList (list, height, r) {
    list.forEach((item) => {
      adjust(item, height, r)
    })
  }
  
  function adjust (tree, height, r) {
    tree.location.r = r
    tree.height = height
    const children = tree.children
    if (children.length === 0) {
      tree.rowspan = height
    } else {
      adjustList(children, height - tree.rowspan, r + tree.rowspan)
    }
  }
  
  function rebuildData (data, keys, startC, startR) {
    const colspan = 1; const rowspan = 1
    return data.map((item, row) => {
      return keys.map((key, col) => {
        const value = item[key]
        const location = {
          c: startC + col * colspan,
          r: startR + row * rowspan
        }
        return {
          value, // 单元格内容
          location, // 单元格位置
          colspan, // 单元格包含列数
          rowspan// 单元格包含行数
        }
      })
    })
  }
  
  function getRef (r1, c1, r2, c2) {
    return `${encodeCell({ r: r1, c: c1 })}:${encodeCell({ r: r2, c: c2 })}`
  }
  
  function getType (value) {
    const str = typeof value
    let t
    if (str === 'number') {
      t = 'n'
    } else if (str === 'boolean') {
      t = 'b'
    } else if (str === 'string') {
      t = 's'
    } else if (!str) {
      t = 'z'
    }
    return t
  }
  
  function getResult ({
    headList,
    dataList,
    startR,
    endR,
    startC,
    endC
  }) {
    // debugger
    const ref = getRef(startR, startC, endR - 1, endC)
    const Sheet1 = {
      '!rows': [],
      '!cols': [],
      '!merges': [],
      '!ref': ref,
      '!fullref': ref
    }
    const handle = (item) => {
      // // debugger;
      const key = encodeCell(item.location)
      const { value, colspan, rowspan, location } = item
      Sheet1[key] = {
        t: getType(value),
        v: value
      }
      if (rowspan > 1 || colspan > 1) {
        Sheet1['!merges'].push({
          s: location,
          e: { r: location.r + rowspan - 1, c: location.c + colspan - 1 }
        })
      }
    }
  
    printTree(headList, handle)
    printArr(dataList, handle)
  
    return {
      SheetNames: ['Sheet1'],
      Sheets: {
        Sheet1: Sheet1
      }
    }
  }
  
  function encodeCell (cell) {
    let col = cell.c + 1
    let s = ''
    for (; col; col = ((col - 1) / 26) | 0) s = String.fromCharCode(((col - 1) % 26) + 65) + s
    return s + (cell.r + 1)
  }
  
  function printTree (list, callBack) {
    list.forEach((tree) => {
      callBack(tree)
      printTree(tree.children, callBack)
    })
  }
  
  function printArr (arr, callBack) {
    for (let i = 0; i < arr.length; i++) {
      const list = arr[i]
      for (let j = 0; j < list.length; j++) {
        const item = list[j]
        callBack(item)
      }
    }
  }
  
  function rebuildSheet (sheet) {
    const set = new Set()
    const mergeList = []
    sheet['!merges'].forEach((item) => {
      if (item.s.c !== item.e.c) {
        const key = encodeCell(item.s)
        set.add(key)
        mergeList.push({
          start: item.s.c,
          end: item.e.c,
          width: getWidth(sheet[key].v)
        })
      }
    })
  
    const list = sheet['!cols']
    Object.keys(sheet).forEach((key) => {
      if (key[0] !== '!' && !set.has(key)) {
        const idx = turnToNum(key)
        const width = getWidth(sheet[key].v)
        if (!list[idx]) {
          list[idx] = {
            wch: width
          }
        } else if (list[idx].wch < width) {
          list[idx].wch = width
        }
      }
    })
  
    mergeList.forEach((item) => {
      let totalWidth = 0
      for (let i = item.start; i < item.end + 1; i++) {
        totalWidth += list[i].wch
      }
      if (totalWidth < item.width) {
        const add = parseInt((item.width - totalWidth) / (item.end - item.start + 1))
        for (let i = item.start; i < item.end + 1; i++) {
          list[i].wch += add
        }
      }
    })
  }
  
  function getWidth (val) {
    if (!val) {
      return 10
    } else if (val.toString().charCodeAt(0) > 255) { /* 再判断是否为中文 */
      return val.toString().length * 2
    } else {
      return val.toString().length
    }
  }
  
  function turnToNum (str) {
    str = str.replace(/\d+/, '')
    let num = 0
    for (let i = 0; i < str.length; i++) {
      num += ((str.charCodeAt(i) - 65) + i * 26)
    }
    return num
  }
  
  function handleData (data) {
    // debugger
    const list = []
    function cycleAdd (data) {
      for (let i = 0; i < data.length; i++) {
        const item = data[i]
        list.push(item)
        if (item.children && item.children.length > 0) {
          cycleAdd(item.children)
        }
      }
    }
    cycleAdd(data)
    return list
  }
  
  // 解析饿了吗表头和表体数据
  export function parseToBook (columns, data) {
    data = handleData(data)
    // console.log(JSON.stringify(data))
    // console.log(JSON.stringify(columns))
    // debugger
    // 根据columns重新构建list,生的的list包含创建book的所有数据
    const startR = 0; let endR = 0; const startC = 0; let endC = 0
    const keys = []
    const list = rebuildList(columns, startC, keys)
  
    // 获取节点的最大高度
    const maxHeight = getMaxHeight(list)
    // 将所有节点都调整为最大高度
    adjustList(list, maxHeight, 0)
  
    endR = startR + list[0]?.height ?? 0
    endC = startC + keys.length
  
    // 对data进行重构
    const dataList = rebuildData(data, keys, startC, endR)
    endR += dataList.length
  
    return getResult({
      headList: list,
      dataList,
      startR,
      startC,
      endR,
      endC
    })
  }
  
  export function autoWidth (data) {
    Object.keys(data.Sheets).forEach((key) => {
      rebuildSheet(data.Sheets[key])
    })
  }

  module.exports = {
    parseToBook,
    autoWidth
  }
  