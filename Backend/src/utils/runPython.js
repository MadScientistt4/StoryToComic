const { spawn } = require('child_process');
const path = require('path');

const runPythonScript = (prompt, outputFile) => {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [
      path.join(__dirname, '../services/generate_image.py'),
      `"${prompt}"`,
      outputFile || `temp-${Date.now()}.png`
    ]);

    let result = '';
    let error = '';

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString();
    });

    pythonProcess.stderr.on('data', (err) => {
      error += err.toString();
    });

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        resolve(result.trim());
      } else {
        reject(`Python error: ${error}`);
      }
    });
  });
};

module.exports = runPythonScript;
