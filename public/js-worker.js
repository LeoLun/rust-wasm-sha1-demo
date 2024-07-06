importScripts('./crypto-js.js')

console.log('CryptoJS', CryptoJS)

function sendProgress(chunkNr, chunks) {
  postMessage({
    type: "progress",
    data: {
      chunkNr,
      chunks
    }
  });
}

function sendResult(result) {
  postMessage({
    type: "result",
    data: result
  });
}

const sha1 = (file) => {
  const hasher = CryptoJS.algo.SHA1.create();
  console.log('hasher', hasher)
  // 将文件按50M分割
  const chunkSize = 50 * 1024 * 1024;
  const chunks = Math.ceil(file.size / chunkSize);
  // 当前分块序号
  let currentChunk = 0;

  // 对文件进行分块读取
  let fileReader = new FileReader();

  // 加载下一块
  function loadNext() {
    const start = currentChunk * chunkSize;
    const end = start + chunkSize >= file.size ? file.size : start + chunkSize;
    fileReader.readAsArrayBuffer(file.slice(start, end));
  }

  // 读取文件完成
  fileReader.onload = function (e) {
    const u8 = new Uint8Array(e.target.result)
    hasher.update(CryptoJS.lib.WordArray.create(u8, u8.length));
    sendProgress(currentChunk + 1, chunks);
    currentChunk++;
    if (currentChunk < chunks) {
      loadNext();
    } else {
      sendResult(hasher.finalize().toString());
    }
  };

  // 加载第一块
  loadNext();
}


const onMessage = (e) => {
  console.log('onMessage js')
  let { file } = e.data;
  sha1(file)
}

async function init() {
  // 注册消息事件
  self.onmessage = onMessage
  // 返回初始化完成
  self.postMessage({
    type: "ready"
  })
};

init();