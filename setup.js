const { exec, spawn } = require('child_process');
console.log('安裝 chalk...');
exec('npm install chalk', (error, stdout, stderr) => {
  if (error) {
    console.error(`安裝 chalk 時出錯: ${error.message}`);
    return;
  }
  console.log('chalk 安裝完成!');
  // Run setupui.js with input and output
  const setupui = spawn('node', ['setupui.js'], { stdio: 'inherit' });

  setupui.on('error', (error) => {
    console.error(`運行設定時出錯: ${error.message}`);
  });

});
