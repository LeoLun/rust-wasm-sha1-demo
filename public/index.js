
const None = {
  status: -1
}

const PaddingFile = {
  status: 0,
  fn: () => {
    const fileInput = document.querySelector('#fileInput')
    fileInput.value = null
  }
}
const ComputeSha1ByWasm = {
  status: 1,
  fn: async (ctx) => {
    const { file } = ctx
    if (!file) {
      return
    }
    logWASM("计算 sha1")
    // 新建 WebWorker 计算 sha1
    logWASM("1-初始化 WebWorker")
    let startTime = Date.now();
    const worker = new Worker('./wasm-worker.js');
    worker.onmessage = function (e) {
      const { data, type } = e.data;
      if (type === 'ready') {
        logWASM("2-初始化 WebWorker 完成")
        worker.postMessage({ file });
        logWASM("3-开始计算 sha1")
        logWASM(" ")
      } else if (type === 'progress') {
        logWASMReplace(`第 ${data.chunkNr} 块计算完成，共 ${data.chunks} 块`)
      } else if (type === 'result') {
        let endTime = Date.now();
        const useTime = endTime - startTime;
        logWASM(`4- 计算sha1完成`)
        worker.terminate(); // 关闭worker

        // 设置结果
        const sha1Element = document.createElement('div')
        sha1Element.textContent = `sha1结果: ${data}`

        const timeElement = document.createElement('div')
        timeElement.textContent = `用时: ${(useTime / 1000).toFixed(2)}s`

        const speedElement = document.createElement('div')
        speedElement.textContent = `速度: ${ uint(file.size / (useTime / 1000))}/s`

        const wasmResult = document.querySelector('#wasmResult')
        wasmResult.appendChild(sha1Element)
        wasmResult.appendChild(timeElement)
        wasmResult.appendChild(speedElement)
        worker.onmessage = null
        nextStatus()
      }
    }
  }
}
const ComputeSha1ByJS = {
  status: 2,
  fn: () => {
    const { file } = ctx
    if (!file) {
      return
    }
    logJS('计算 sha1')
    // 新建 WebWorker 计算 sha1
    logJS("1-初始化 WebWorker")
    let startTime = Date.now();
    const worker = new Worker('./js-worker.js');
    worker.onmessage = function (e) {
      const { data, type } = e.data;
      if (type === 'ready') {
        logJS("2-初始化 WebWorker 完成")
        worker.postMessage({ file });
        logJS("3-开始计算 sha1")
        logJS(" ")
      } else if (type === 'progress') {
        logJSReplace(`第 ${data.chunkNr} 块计算完成，共 ${data.chunks} 块`)
      } else if (type === 'result') {
        let endTime = Date.now();
        const useTime = endTime - startTime;
        logJS(`4- 计算sha1完成`)
        worker.terminate(); // 关闭worker

        // 设置结果
        const sha1Element = document.createElement('div')
        sha1Element.textContent = `sha1结果: ${data}`

        const timeElement = document.createElement('div')
        timeElement.textContent = `用时: ${(useTime / 1000).toFixed(2)}s`

        const speedElement = document.createElement('div')
        speedElement.textContent = `速度: ${ uint(file.size / (useTime / 1000))}/s`

        const jsResult = document.querySelector('#jsResult')
        jsResult.appendChild(sha1Element)
        jsResult.appendChild(timeElement)
        jsResult.appendChild(speedElement)
        worker.onmessage = null
        nextStatus()
      }
    }
  }
}
const SuccessSha1 = {
  status: 3,
  fn: () => {
    const fileInput = document.querySelector('#fileInput')
    fileInput.value = null
    ctx.status = PaddingFile.status
  }
}

const ctx = {
  status: None.status
}

const nextStatus = () => {
  let next;

  if (ctx.status === None.status) {
    next = PaddingFile
  }
  if (ctx.status === PaddingFile.status) {
    next = ComputeSha1ByWasm
  }
  if (ctx.status === ComputeSha1ByWasm.status) {
    next = ComputeSha1ByJS
  }
  if (ctx.status === ComputeSha1ByJS.status) {
    next = SuccessSha1
  }

  ctx.status = next.status
  next.fn(ctx)
}

const uint = (n, s = '') => {
  const _unit = ['KB', 'MB', 'GB', 'TB'].find(_ => (n /= 1024) < 1024)
  return n.toFixed(2) + s + _unit
}


const logJS = (str) => {
  const logElement = document.querySelector('#logJS')
  logElement.textContent = `${logElement.textContent}\r\n${str}`
}

const logJSReplace = (str) => {
  const logElement = document.querySelector('#logJS')
  const arr = logElement.textContent.split('\r\n')
  arr.pop()
  arr.push(str)
  logElement.textContent = arr.join('\r\n')
}


const logWASM = (str) => {
  const logElement = document.querySelector('#logWasm')
  logElement.textContent = `${logElement.textContent}\r\n${str}`
}

const logWASMReplace = (str) => {
  const logElement = document.querySelector('#logWasm')
  const arr = logElement.textContent.split('\r\n')
  arr.pop()
  arr.push(str)
  logElement.textContent = arr.join('\r\n')
}

const onFileChange = async (e) => {
  if (ctx.status !== PaddingFile.status) {
    alert('等待上一个计算完成')
    return
  }

  const file = e.target.files[0]
  ctx.file = file
  // 设置文件名和文件大小
  const fileNameElement = document.querySelector('#fileName')
  const fileSizeElement = document.querySelector('#fileSize')

  fileNameElement.textContent = `文件名: ${file.name}`
  fileSizeElement.textContent = `文件大小: ${uint(file.size)}`
  // 清空内容
  const logElement = document.querySelector('#logWasm')
  logElement.textContent = ''
  const logJSElement = document.querySelector('#logJS')
  logJSElement.textContent = ''
  const wasmResult = document.querySelector('#wasmResult')
  wasmResult.innerHTML = ''
  const jsResult = document.querySelector('#jsResult')
  jsResult.innerHTML = ''

  nextStatus()
}

window.onload = async () => {
  const fileInput = document.querySelector('#fileInput')
  fileInput.addEventListener('change', onFileChange)
  nextStatus()
}