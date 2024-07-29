var worker = null;
var isWorkerStopped;
let isIcaoCheckRunning = false;
var isIcaoRunning = false;
export function StartWorker() {
  console.log("=========StartWorker()============");
  var webCamDevice = window.GetWebCameProvider();

  isWorkerStopped = false;

  if (isWorkerStopped == true) {
    return;
  } else if (isWorkerStopped == false) {
    window.setInterval(function () {
      if (!isIcaoCheckRunning && !isWorkerStopped) {
        var canvas = icaoAppWC.shadowRoot.getElementById("canvas");
        if (canvas) {
          var img = document.createElement("img_TempToSave");
          img.src = canvas.toDataURL();
          img.width = canvas.width;
          img.height = canvas.height;

          isIcaoRunning = true;

          if (!worker) {
            worker = run(function () {
              // worker.postMessage('I am a worker!');
              // self.close();
            });
          }
          worker.onmessage = (event) => {
            isIcaoCheckRunning = true;
            webCamDevice.ICOAChecking(img.src);
            worker.terminate();
            isIcaoRunning = false;
          };
          isIcaoCheckRunning = true;
          webCamDevice.ICOAChecking(img.src);
          worker.postMessage(img.src);
          // worker.terminate();
          if (document.getElementById("img_TempToSave")) {
            document.removeChild(document.getElementById("img_TempToSave"));
          }
        }
      }
    }, 200);
  }
}

var fn = "http://localhost:9002/scripts/worker.js";
function run(fn) {
  return new Worker(URL.createObjectURL(new Blob(["(" + fn + ")()"])));
}

export function StopWorker() {
  isWorkerStopped = true;
  isIcaoCheckRunning = false;
  if (worker != null) {
    worker.terminate();
    worker = null;
  }
}

export function UpdateIsIcaoCheckRunning(status) {
  isIcaoCheckRunning = status;
}
