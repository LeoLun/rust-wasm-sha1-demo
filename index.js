// 拷贝public文件夹的文件到 dist
// 拷贝/pkg/rust_wasm_sha1_demo.js, /pkg/rust_wasm_sha1_demo_bg.wasm 到 dist
const fs = require('fs-extra');

async function removeDistFolder() {
  try {
    await fs.remove('dist');
    console.log('Dist folder removed successfully!');
  } catch (err) {
    console.error(err);
  }
}

async function copyPublicToDist() {
  try {
    await fs.copy('./public', 'dist');
    console.log('Public folder copied to dist folder successfully!');
  } catch (err) {
    console.error(err);
  }
}

async function copyFilesToDist() {
  try {
    await fs.copy('./pkg/rust_wasm_sha1_demo.js', 'dist/rust_wasm_sha1_demo.js');
    await fs.copy('./pkg/rust_wasm_sha1_demo_bg.wasm', 'dist/rust_wasm_sha1_demo_bg.wasm');
    console.log('Files copied to dist folder successfully!');
  } catch (err) {
    console.error(err);
  }
}

async function init() {
  await removeDistFolder();
  await copyPublicToDist();
  await copyFilesToDist();
}

init()