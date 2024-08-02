var worker = null;
var isWorkerStopped;
let isIcaoCheckRunning = false;
var isIcaoRunning = false;
let workerIntervalId = null;
export function StartWorker() {
  console.log("=>>>>>> Start-Worker() is called");
  var webCamDevice = window.GetWebCameProvider();

  isWorkerStopped = false;

  if (isWorkerStopped == true) {
    return;
  } else if (isWorkerStopped == false) {
    if (!worker) {
      worker = run(function () {
        // worker.postMessage('I am a worker!');
        // self.close();
      });
    }
    workerIntervalId = window.setInterval(handleWorkerInterval, 1000);
  }
}

const canvas = icaoAppWC.shadowRoot.getElementById("canvas");
const img = document.createElement("img");
function handleWorkerInterval() {
  if (!isIcaoCheckRunning && !isWorkerStopped) {
    if (canvas) {
      img.src = canvas.toDataURL();
      img.width = canvas.width;
      img.height = canvas.height;

      isIcaoRunning = true;

      // if (!worker) {
      //   worker = run(function () {
      //     // worker.postMessage('I am a worker!');
      //     // self.close();
      //   });
      // }
      // worker.onmessage = (event) => {
      //   console.log({ event });
      //   isIcaoCheckRunning = true;
      //   webCamDevice.ICOAChecking(img.src);
      //   // worker.terminate();
      //   isIcaoRunning = false;
      // };
      isIcaoCheckRunning = true;
      webCamDevice.ICOAChecking(img.src);
      // worker.postMessage(img.src);
      // worker.terminate();
      // if (document.getElementById("img_TempToSave")) {
      //   document.removeChild(document.getElementById("img_TempToSave"));
      // }
    }
  }
}

function run(fn) {
  return new Worker(URL.createObjectURL(new Blob(["(" + fn + ")()"])));
}

export function StopWorker() {
  console.log("=>>>>>> StopWorker() is called");
  isWorkerStopped = true;
  isIcaoCheckRunning = false;
  if (worker != null) {
    worker.terminate();
    worker = null;
    window.clearInterval(workerIntervalId);
    workerIntervalId = null;
  }
}

export function UpdateIsIcaoCheckRunning(status) {
  isIcaoCheckRunning = status;
}
