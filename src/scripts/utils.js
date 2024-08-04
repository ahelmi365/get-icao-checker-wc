import { t } from "../i18n/translate.js";
// console.log(window.icaoAppWC);
// set the backendURL

const IcaoAttributesValues = {
  TOO_LOW: "TooLow",
  TOO_HIGH: "TooHigh",
  IN_RANGE: "InRange",
  COMPATIBLE: "Compatible",
  IN_COMPATIBLE: "Incompatible",
  DEFAULT: "No-Status",
};
const icaoStatusInstructions = icaoAppWC.shadowRoot.getElementById(
  "icao-status-instructions"
);
if (icaoStatusInstructions) {
  icaoStatusInstructions.style.display = "none";
}

const leftFeatures = icaoAppWC.shadowRoot.getElementById("left-features");
const rightFeatures = icaoAppWC.shadowRoot.getElementById("right-features");
const leftAndRightFeatures = [
  ...leftFeatures.children,
  ...rightFeatures.children,
];

const connectCameraBtnContainer = icaoAppWC.shadowRoot.getElementById(
  "connect-camera-btn-container"
);
const captureImageBtnContainer = icaoAppWC.shadowRoot.getElementById(
  "capture-image-btn-container"
);
const saveCroppedImageContainer = icaoAppWC.shadowRoot.getElementById(
  "save-captured-image-btn-container"
);
const divICAOCheckingMessage = icaoAppWC.shadowRoot.getElementById(
  "divICAOCheckingMessage"
);
saveCroppedImageContainer.style.display = "none";
const connectCameraBtn =
  icaoAppWC.shadowRoot.getElementById("connect-camera-btn");
const captureImageBtn =
  icaoAppWC.shadowRoot.getElementById("capture-image-btn");
const croppedimg = icaoAppWC.shadowRoot.getElementById("cropped");

const video = icaoAppWC.shadowRoot.getElementById("video");
const canvas = icaoAppWC.shadowRoot.getElementById("canvas");
const lblMessageErrorElm =
  icaoAppWC.shadowRoot.getElementById("lblMessageForICAO");

const icaoContainer = icaoAppWC.shadowRoot.querySelector(
  ".icao-container-modal"
);
// console.log(EnrolmentDevices.WebCam.Scripts);

// const [isLiveIcaoData, setIsLiveIcaoData] = useState(false);
let isLiveIcaoData = true;
const setIsLiveIcaoData = (value) => {
  isLiveIcaoData = value;
};

//#region Properties
// const [avaliableCameras, setAvailableCameras] = useState({});
const avaliableCameras = [];
const setAvailableCameras = (newCamera) => {
  avaliableCameras.push(newCamera);
};

let pausedRequested = false;
// export let webCamDevice = null;
// let serviceProxyForWebCam;

// const [loading, setLoading] = useState(false);
let loading;
const setLoading = () => {};
// const [isPhotoCaptured, setIsPhotoCaptured] = useState(false);
export let isPhotoCaptured = false;
const setIsPhotoCaptured = () => {};
// const [isDeviceAvailable, setIsDeviceAvailable] = useState(false);
export let isDeviceAvailable = true;
const setIsDeviceAvailable = () => {};
// const [isDeviceConnected, setIsDeviceConnected] = useState(false);
export let isDeviceConnected = false;
const setIsDeviceConnected = (val) => {
  isDeviceConnected = val;
};

let isICAOSeriveActive = false;
const setIsICAOSeriveActive = (val) => {
  isICAOSeriveActive = val;
};
// const CheckingICAOServiceThread = useRef();
var CheckingICAOServiceThread = null;
// const [isCheckingICAOServiceThread, setIsCheckingICAOServiceThread] = useState(true);
export var isCheckingICAOServiceThread = true;
export const setIsCheckingICAOServiceThread = (value) => {
  isCheckingICAOServiceThread = value;
};

// const [cachedCamera, setCachedCamera] = useState("");
export let cachedCamera;
export const setCachedCamera = (value) => {
  cachedCamera = value;
};
// const [selectedCamera, setSelectedCamera] = useState();
export let selectedCamera;
const setSelectedCamera = () => {};
// const videoRef = useRef(null);
export let videoRef;
//#endregion

export const onLoadUtils = () => {
  if (icaoAppWC.isICAO) {
    leftFeatures.classList.add("flex-column-space-around-center");
    leftFeatures.classList.remove("d-none");
    rightFeatures.classList.add("flex-column-space-around-center");
    rightFeatures.classList.remove("d-none");
  }
};

// #region functions
// enumerateDevices
export function enumerateDevices(cachedConnectedCamera) {
  // console.log("======== enumerateDevices() is called");
  setLoading(true);
  let avCameras = {};
  navigator.mediaDevices
    .getUserMedia({ audio: false, video: true })
    .then(function (stream) {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setLoading(false);
        return;
      }
      navigator.mediaDevices
        .enumerateDevices()
        .then(function (devices) {
          devices.forEach(function (device) {
            if (device.kind === "videoinput") {
              avCameras[device.label] = device.deviceId;
            }
          });
          setAvailableCameras(avCameras);
          const cbAvaliableCameras =
            icaoAppWC.shadowRoot.getElementById("cbAvaliableCameras");

          Object.keys(avCameras).map((item, index) => {
            const cameraLabel = avCameras[item];
            const option = document.createElement("option");
            option.value = cameraLabel;
            option.id = cameraLabel;
            option.textContent = item;

            if (
              !Array.from(cbAvaliableCameras.children).some(
                (child) => child.id === option.id
              )
            ) {
              cbAvaliableCameras.appendChild(option);
            }
          });

          //   setAvailableCameras((prevCameras) => ({
          //     ...prevCameras,
          //     ...avCameras,
          //   }));
          setCachedConnectedCamera(avCameras, cachedConnectedCamera);
          connectwithCameraFromLocalStorage();
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          // connectCamera(cachedConnectedCamera);
          const selecetedCameraIDFromLocalStorage =
            getSelectedCameraFromLocalStorage();
          try {
            connectCamera(selecetedCameraIDFromLocalStorage);
          } catch (error) {
            console.log(error);
          }
        })
        .catch(function (err) {
          console.error(err);
        })
        .finally(() => {
          // console.log("finally");
        });
      {
        setLoading(false);
      }
    })
    .catch(function (err) {
      setLoading(false);
      console.log(err);
      alert(t("cameranotallowed"));
    });
}

// setCachedConnectedCamera
export function setCachedConnectedCamera(avCameras, cachedConnectedCamera) {
  let isCameraFound = false;
  Object.values(avCameras).forEach((element) => {
    if (element == cachedConnectedCamera) {
      setSelectedCamera(element);
      isCameraFound = true;
    }
  });
  if (!isCameraFound) {
    setSelectedCamera(Object.values(avCameras)[0]);
  }
}

// stopCheckingICAOServiceThread
export function stopCheckingICAOServiceThread() {
  clearICAOServiceThread();
  setIsCheckingICAOServiceThread(false);
  stopCameraIndicatorInBrowser();

  icaoAppWC.grapFrameIntervalId = null;
  window.stream = null;
}

export function clearICAOServiceThread(id) {
  clearInterval(id);
  CheckingICAOServiceThread = null;
}

export function getWebCamDevice() {
  return new Promise((resolve, reject) => {
    // Assume that GetWebCameProvider takes a callback that is called when the WebCam object is fully initialized
    window.GetWebCameProvider((webCamDevice) => {
      if (webCamDevice) {
        resolve(webCamDevice);
      } else {
        reject("Failed to initialize WebCam device");
      }
    });
  });
}

// ConnectCamera
export function connectCamera(camera) {
  setIsLiveIcaoData(true);

  try {
    setIsPhotoCaptured(false);
    connectCameraBtnContainer.style.display = "none";
    captureImageBtnContainer.style.display = "flex";

    if (icaoAppWC.isICAO) {
      webCamDevice = window.GetWebCameProvider();
      // {ICOAChecking: ƒ, IsServiceHealthy: ƒ, GetAndOpenDevice: ƒ, GetCropImage: ƒ}

      webCamDevice.onUpdateICAOCheck = function (IcaoResult) {
        // UpdateIsIcaoCheckRunning(false);
        IcaoResult && IcaoResult.Success
          ? handleSuccessInICAOChecking(IcaoResult)
          : handleFailureInICAOChecking(IcaoResult);
      };

      // StopWorker();
    }
    pausedRequested = false;

    startVideo();

    if (icaoAppWC.isICAO) {
      // StartWorker();
    }
    setIsDeviceConnected(true);

    // const cameraCopy = JSON.parse(JSON.stringify(camera));
    croppedimg.style.display = "none";

    addSelectedCameraToLocalStorage(camera);
  } catch (error) {
    console.log("error from connect camera", error);
    // icaoStatusInstructions.style.display = "flex";
    // connectCameraBtn.disabled = true;
    // captureImageBtn.disabled = true;
    // lblMessageErrorElm.innerText = t("WebCamserviceisnotstarted");
  }
}

let resolutionWidth = 640;
let resolutionHeight = 480;

let preferredResolutions = [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 640, height: 480 },
  // Add more resolutions as needed
];

export async function startVideo() {
  // console.log("Started the video()");

  // method load() resets the media element to its initial state
  // and begins the process of selecting a media source and loading the media in preparation for playback
  // to begin at the beginning.
  video.load();

  canvas.width = resolutionWidth;
  canvas.height = resolutionHeight; //video.videoHeight;//"400";//

  video.style.display = "inline";

  // if ((<any>window).stream) {
  //   (<any>window).stream.getTracks().forEach(track => {
  // 	track.stop();
  //   });
  // }

  stopCameraIndicatorInBrowser();

  const videoSource = selectedCamera;
  const constraints = {
    video: {
      deviceId: videoSource ? { exact: videoSource } : undefined,
      width: 640,
      height: 480,
    },
  };
  let mediaStream = null;
  try {
    // for (let resolution of preferredResolutions) {
    //   constraints.video = {
    //     ...constraints.video,
    //     width: resolution.width,
    //     height: resolution.height,
    //   };

    //   try {
    //     mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    //     break; // Break out of the loop if successful
    //   } catch (error) {
    //     // Continue trying with the next resolution
    //   }
    // }
    mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

    window.stream = mediaStream;
    video.srcObject = mediaStream;
    //pause() method will pause playback of the media,
    // if the media is already in a paused state this method will have no effect.
    video.pause();
    // const playPromise = await video.play(); // Resume playing the video
    video.onloadeddata = async () => {
      try {
        let streamSettings = mediaStream.getVideoTracks()[0].getSettings();

        // actual width & height of the camera video
        let streamWidth = streamSettings.width;
        let streamHeight = streamSettings.height;

        resolutionWidth = streamWidth;
        resolutionHeight = streamHeight;
        await video.play(); // Resume playing the video
      } catch (err) {
        console.error("Error playing video:", err);
      }
    };
    // UpdateIsIcaoCheckRunning(false);
  } catch (error) {
    console.log("error from startVieo() function");
    console.log({ error });
    if (error.name === "NotAllowedError") {
      //   setShowICAOModal(false);
      setApiErros(
        "Camera access was previously blocked. Please change your permission settings."
      );
    }
  }

  // clearInterval(faceDetectedRectangleDrawingThread);
  // faceDetectedRectangleDrawingThread = null;
  window.clearInterval(icaoAppWC.grapFrameIntervalId);

  icaoAppWC.grapFrameIntervalId = setInterval(() => {
    // console.log(icaoAppWC.grapFrameIntervalId);
    if (window.stream) {
      // console.log("window.stream running");
      grapFrame();
    }
  }, 1000);
}
// a function to stop video streaming from user's camera
export function stopVideoStream() {
  // console.log("stopVideoStream() is called");

  window.clearInterval(icaoAppWC.grapFrameIntervalId);
  // icaoAppWC.grapFrameIntervalId = null;

  const stream = video.srcObject;
  const tracks = stream?.getTracks();
  if (!tracks) {
    return;
  }
  tracks.forEach(function (track) {
    track.stop();
  });

  video.srcObject = null;
}

// grapFrame
export function grapFrame() {
  // const startTime = performance.now();
  if (video) {
    canvas.width = resolutionWidth;
    canvas.height = resolutionHeight;

    const ctx = canvas.getContext("2d");

    if (!pausedRequested) {
      canvas.width = resolutionWidth;
      canvas.height = resolutionHeight;
      ctx.drawImage(video, 0, 0, resolutionWidth, resolutionHeight);
      if (icaoAppWC.isICAO) {
        checkICAOResult(canvas);
      }
    } else {
      pausedRequested = true;
    }
  }
  const endTime = performance.now();
  // console.log(`time diff = ${(endTime - startTime).toFixed(0)}ms`);
}

export function _grapFrame() {
  // const startTime = performance.now();
  if (video && canvas) {
    // Set canvas size only if it has changed to avoid redundant operations
    if (
      canvas.width !== resolutionWidth ||
      canvas.height !== resolutionHeight
    ) {
      canvas.width = resolutionWidth;
      canvas.height = resolutionHeight;
    }

    const ctx = canvas.getContext("2d");

    if (!pausedRequested) {
      ctx.drawImage(video, 0, 0, resolutionWidth, resolutionHeight);

      // Schedule image processing for the next frame
      requestAnimationFrame(() => checkICAOResult(canvas));
    } else {
      pausedRequested = true;
    }
  }
  // const endTime = performance.now();
  // console.log(`time diff = ${(endTime - startTime).toFixed(0)}ms`);
}
const getBase64FromCanvasBlob = (canvas) => {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        resolve(base64data);
      };
      reader.readAsDataURL(blob);
    }, "image/png");
  });
};
// const icaoWorker = new Worker("../scripts/_icaoWorker.js");
const _checkICAOResult = (canvas) => {
  // const startTime = performance.now();

  webCamDevice.ICOAChecking(canvas.toDataURL());

  const endTime = performance.now();
  // console.log(`time diff = ${(endTime - startTime).toFixed(0)}ms`);
};
const checkICAOResult = (canvas) => {
  // const startTime = performance.now();
  getBase64FromCanvasBlob(canvas).then((base64) =>
    webCamDevice.ICOAChecking(base64)
  );
  const endTime = performance.now();
  // console.log(`time diff = ${(endTime - startTime).toFixed(0)}ms`);
};
// HandleFailureInICAOChecking
export function handleFailureInICAOChecking(IcaoResult) {
  displayICAOCheckingMessage(IcaoResult?.Message);
  $("#tblICAOFeaturesResult tbody").empty();
}

let faceFeaturesStatus = new Array(20).fill("0");
export const reestCashedArray = () => {
  faceFeaturesStatus = new Array(20).fill("0");
};

const applyStyleToLeftAndRightFeatures = (faceFeatures) => {
  faceFeatures.map((icaoItem, index) => {
    const icaoCardElement = leftAndRightFeatures[index];

    if (icaoItem.ICAOStatusStr === IcaoAttributesValues.COMPATIBLE) {
      icaoCardElement.classList.add("icao-green-background");
      icaoCardElement.classList.remove("icao-red-background");
    } else if (icaoItem.ICAOStatusStr === IcaoAttributesValues.IN_COMPATIBLE) {
      icaoCardElement.classList.remove("icao-green-background");
      icaoCardElement.classList.add("icao-red-background");
    }

    // ${FaceAttributeIdStr}-feature-icon
    // icaoCardElement.id = `icao-face-feature-${icaoItem.FaceAttributeIdStr}`;
    const toolTipId = `icao-face-feature-${icaoItem.FaceAttributeIdStr}`;

    updateTooltipText(toolTipId, faceFeaturesStatus, index, icaoItem);
  });
};

let faceFeatures = [];
const fillFaceFeaturesWithNoGender = (parsedICAOResult) => {
  faceFeatures = parsedICAOResult
    .filter((result) => result.FaceAttributeIdStr !== "Gender")
    .map((result, index) => ({
      ...result,
      FaceAttributeId: index,
    }));
};
// HandleSuccessInICAOChecking

export function handleSuccessInICAOChecking(IcaoResult) {
  // console.log({ IcaoResult });
  displayICAOCheckingMessage("");
  setIsDeviceConnected(true);
  const parsedICAOResult = JSON.parse(IcaoResult.Result);

  fillFaceFeaturesWithNoGender(parsedICAOResult);

  applyStyleToLeftAndRightFeatures(faceFeatures);

  showYawRollPitchErrorMessage(faceFeatures);
}

const isFeatureInRange = (feature) => {
  return feature && feature[0].FaceAttributeRangeStatus === "InRange";
};

const getFeatureByAttributeIdStr = (faceFeatures, faceAttributeIdStr) => {
  return faceFeatures.filter((el) => {
    return el.FaceAttributeIdStr == faceAttributeIdStr;
  });
};

const enableDisableCameraButtons = (
  isRollFeatureInRange,
  isPitchFeatureInRange,
  isYawhFeatureInRange
) => {
  if (isRollFeatureInRange && isPitchFeatureInRange && isYawhFeatureInRange) {
    connectCameraBtn.disabled = false;
    captureImageBtn.disabled = false;
    setIsDeviceConnected(true);
  } else if (
    !isRollFeatureInRange ||
    !isPitchFeatureInRange ||
    !isYawhFeatureInRange
  ) {
    connectCameraBtn.disabled = true;
    captureImageBtn.disabled = true;
    displayICAOCheckingMessage(t("IcaoErrorMessage"));
    // setIsDeviceConnected(false);
  }
};
// showYawRollPitchErrorMessage

export function showYawRollPitchErrorMessage(faceFeatures) {
  // Roll
  const rollFeature = getFeatureByAttributeIdStr(faceFeatures, "Roll");
  const isRollFeatureInRange = isFeatureInRange(rollFeature);

  // Pitch
  const pitchFeature = getFeatureByAttributeIdStr(faceFeatures, "Pitch");
  const isPitchFeatureInRange = isFeatureInRange(pitchFeature);

  // Yaw
  const yawFeature = getFeatureByAttributeIdStr(faceFeatures, "Yaw");
  const isYawhFeatureInRange = isFeatureInRange(yawFeature);

  enableDisableCameraButtons(
    isRollFeatureInRange,
    isPitchFeatureInRange,
    isYawhFeatureInRange
  );
}
const updateTooltipText = (toolTipId, faceFeaturesStatus, index, icaoItem) => {
  // const tooltipInstance_ = bootstrap.Tooltip.getInstance(
  //   `#${toolTipId.toLowerCase()}`
  // );

  const tooltipInstance = icaoAppWC.shadowRoot.getElementById(
    toolTipId.toLowerCase()
  );

  if (
    faceFeaturesStatus[index] !==
      `${icaoItem.FaceAttributeRangeStatus}${icaoItem.ICAOStatusStr}` ||
    faceFeaturesStatus[index] === "0"
  ) {
    faceFeaturesStatus[
      index
    ] = `${icaoItem.FaceAttributeRangeStatus}${icaoItem.ICAOStatusStr}`;

    const toolTipRangStatusText =
      icaoItem.FaceAttributeRangeStatus === IcaoAttributesValues.TOO_LOW
        ? `<span class="red-font">${t("toolow")}</span>`
        : icaoItem.FaceAttributeRangeStatus === IcaoAttributesValues.TOO_HIGH
        ? `<span class="red-font">${t("toohigh")}</span>`
        : icaoItem.FaceAttributeRangeStatus === IcaoAttributesValues.IN_RANGE
        ? ` <span class="green-font">${t("inrange")}</span>`
        : "not-found";

    const tooltipCompatabilityText =
      icaoItem.ICAOStatusStr === IcaoAttributesValues.COMPATIBLE
        ? ""
        : `<p class="white-font">${t(
            "pleasecheckspec",
            icaoItem.FaceAttributeIdStr
          )}</p>`;

    const tooltipIcaoStatusText = `<p className="icao-card-details-item white-font"> 
    ${t("icaostatus")} <strong><span class= ${
      icaoItem.ICAOStatusStr === IcaoAttributesValues.COMPATIBLE
        ? "green-font"
        : "red-font"
    }>${icaoItem.ICAOStatusStr}</span></strong>.</p>`;

    tooltipInstance.querySelector(
      ".tooltip-text"
    ).innerHTML = `<p class="icao-card-details-item white-font text-white">${t(
      "the"
    )} ${icaoItem.FaceAttributeIdStr} ${t(
      "is"
    )} <strong>${toolTipRangStatusText}</strong></p> ${tooltipIcaoStatusText}${tooltipCompatabilityText}`;
  }
};
//  IsShowOnlyError() // to filter only error, not needed, commented by Ali
//  StyleICAOFeatureRow() // to draw the table, not needed , commented by Ali

// DisplayICAOCheckingMessage

if (!icaoAppWC.isICAO) {
  divICAOCheckingMessage.style.display = "none";
}
export function displayICAOCheckingMessage(message) {
  // console.log("DisplayICAOCheckingMessage", message);
  // console.log("typeof message",  message.length);
  if (divICAOCheckingMessage) {
    divICAOCheckingMessage.style.display = "flex";
    // divICAOCheckingMessage.style.visibility = "visible";
    if (message != undefined && message.length > 0) {
      if (message !== divICAOCheckingMessage.innerText) {
        divICAOCheckingMessage.innerText = t(message);
      }
      captureImageBtn.disabled = true;
    } else {
      divICAOCheckingMessage.style.display = "none";
      captureImageBtn.disabled = false;
    }
    // setIsDeviceConnected(false);
  }
}

export function retrieveScripts(scriptsURL) {
  for (let i = 0; i < scriptsURL.length; i++) {
    const isScriptExist = icaoAppWC.shadowRoot.querySelector(
      `script[src="${scriptsURL[i]}"]`
    );
    if (!isScriptExist) {
      const script = document.createElement("script");
      script.src = scriptsURL[i];
      script.async = false;
      icaoAppWC.shadowRoot.appendChild(script);
    }
  }
}

export function removeAllICAOScripts(scriptsURL) {
  for (let i = 0; i < scriptsURL.length; i++) {
    const isScriptExist = icaoAppWC.shadowRoot.querySelector(
      `script[src="${scriptsURL[i]}"]`
    );
    if (isScriptExist) {
      isScriptExist.remove();
    }
  }
}

// Reconnect
export async function reconnect() {
  console.log("Reconnect ()");
  if (icaoAppWC.isICAO) {
    // console.log(serviceProxyForWebCam ?? undefined);
    if (window.serviceProxyForWebCam == null) {
      removeAllICAOScripts(EnrolmentDevices.WebCam.Scripts);
      retrieveScripts(EnrolmentDevices.WebCam.Scripts);
      console.log("serviceproxyforwebacm  = null");
    }
    setIsICAOSeriveActive(false);
    try {
      console.log("======= in Reconnect Try Block");
      serviceProxyForWebCam.Connection.start(
        { transport: ["webSockets"], waitForPageLoad: true },
        function () {
          console.log("connection re-established! =============");
        }
      ).done(function (result) {
        console.log({ result });
        console.log("re-connecting is done!");
        handleConnectionSuccess(result);
        enumerateDevices(cachedCamera);
      });
      console.log("======end of Reconnect try block");
    } catch (exe) {
      console.log("=========in Reconnect catch block");
      console.log({ exe });
    }
  }
}

function handleConnectionSuccess(result) {
  console.log("Handling connection success with result:", result);
  // Additional code here
}

//CaptureImage
export async function _captureImage() {
  const startTime = performance.now();

  pausedRequested = true;
  // StopWorker();
  video.pause();

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, resolutionWidth, resolutionHeight);

  if (icaoAppWC.isICAO) {
    const cropedImageResult = await window
      .GetWebCameProvider()
      .GetCropImage(canvas.toDataURL("image/jpeg", 1.0));

    if (cropedImageResult) {
      croppedimg.onload = function () {
        canvas.width = croppedimg.naturalWidth;
        canvas.height = croppedimg.naturalHeight;
        canvas
          .getContext("2d")
          .drawImage(
            croppedimg,
            0,
            0,
            croppedimg.naturalWidth,
            croppedimg.naturalHeight
          );

        video.style.display = "none";
        canvas.style.display = "none";
        croppedimg.style.display = "block";
        croppedimg.animate(
          {
            opacity: 1,
          },
          500
        );

        icaoStatusInstructions.style.display = "none";
        connectCameraBtn.disabled = false;
        captureImageBtn.disabled = false;
        setIsDeviceConnected(false);
        setIsPhotoCaptured(true);
        connectCameraBtnContainer.style.display = "flex";
        captureImageBtnContainer.style.display = "none";
        saveCroppedImageContainer.style.display = "flex";
      };
      croppedimg.src = cropedImageResult;
      console.log("calling stopvideo from captureImage()");
      stopVideoStream();
      // window.stream = null;

      setIsLiveIcaoData(false);
    } else {
      displayICAOCheckingMessage("Cannot detect face");
      setIsPhotoCaptured(false);
      connectCameraBtnContainer.style.display = "none";
      captureImageBtnContainer.style.display = "flex";
    }
  } else {
    croppedimg.src = canvas.toDataURL("image/jpeg", 1.0);
    video.style.display = "none";
    canvas.style.display = "none";
    croppedimg.style.display = "block";

    icaoStatusInstructions.style.display = "none";
    connectCameraBtn.disabled = false;
    captureImageBtn.disabled = false;
    setIsDeviceConnected(false);
    setIsPhotoCaptured(true);
    connectCameraBtnContainer.style.display = "flex";
    captureImageBtnContainer.style.display = "none";
    saveCroppedImageContainer.style.display = "flex";
    window.stream = null;

    setIsLiveIcaoData(false);
  }
  const endTime = performance.now();
  console.log(
    `BEFORE captureImage() diff = ${(endTime - startTime).toFixed(0)}ms`
  );
}

const handleCroppedImage = () => {
  video.style.display = "none";
  canvas.style.display = "none";
  croppedimg.style.display = "block";

  icaoStatusInstructions.style.display = "none";
  connectCameraBtn.disabled = false;
  captureImageBtn.disabled = false;
  setIsDeviceConnected(false);
  setIsPhotoCaptured(true);
  connectCameraBtnContainer.style.display = "flex";
  captureImageBtnContainer.style.display = "none";
  saveCroppedImageContainer.style.display = "flex";
  stopVideoStream();
  setIsLiveIcaoData(false);
};
export async function captureImage() {
  // const startTime = performance.now();

  pausedRequested = true;
  video.pause();

  if (icaoAppWC.isICAO) {
    const base64 = await getBase64FromCanvasBlob(canvas);

    const cropedImageResult = await window
      .GetWebCameProvider()
      .GetCropImage(base64);
    if (cropedImageResult) {
      croppedimg.src = cropedImageResult;
      handleCroppedImage();
    } else {
      displayICAOCheckingMessage("Cannot detect face");
      setIsPhotoCaptured(false);
      connectCameraBtnContainer.style.display = "none";
      captureImageBtnContainer.style.display = "flex";
    }
  } else {
    getBase64FromCanvasBlob(canvas).then(
      (base64) => (croppedimg.src = "data:image/jpeg;base64," + base64)
    );

    handleCroppedImage();
  }
  // const endTime = performance.now();
  //console.log( `AFTER -- captureImage() diff = ${(endTime - startTime).toFixed(0)}ms`);
}

// SaveCaptureedImg
export function saveCaptureedImg(getImgSrc) {
  stopCameraIndicatorInBrowser();
  clearICAOServiceThread();
  // updatePhotoImage(croppedimg.src);
  if (icaoAppWC.savedImageElm) {
    icaoAppWC.savedImageElm.src = croppedimg.src;
  }
  console.log(typeof getImgSrc);
  if (typeof getImgSrc === "function") {
    getImgSrc(croppedimg.src);
  }

  stopVideoStream();
  croppedimg.style.display = "none";
}

// StopCameraIndicatorInBrowser
export function stopCameraIndicatorInBrowser() {
  if (window?.stream) {
    // stopVideoStream();
    window?.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
}

// GetConnectionState
icaoAppWC.icaoServiceConnectionStateIntervalId = "test";
export async function getICAOServiceConnectionState() {
  if (isCheckingICAOServiceThread && icaoAppWC.isICAO) {
    icaoAppWC.icaoServiceConnectionStateIntervalId = setInterval(async () => {
      // serviceProxyForWebCam = window.serviceProxyForWebCam ?? undefined;

      if (
        typeof serviceProxyForWebCam == "undefined" ||
        window.serviceProxyForWebCam === undefined
      ) {
        console.log(window.serviceProxyForWebCam);
        icaoStatusInstructions.style.display = "flex";
        connectCameraBtn.disabled = true;
        captureImageBtn.disabled = true;
        return (lblMessageErrorElm.innerText = t("WebCamserviceisnotstarted"));
      }
      switch (serviceProxyForWebCam.Connection.state) {
        case 0: {
          icaoStatusInstructions.style.display = "flex";
          connectCameraBtn.disabled = true;
          captureImageBtn.disabled = true;
          return (lblMessageErrorElm.innerText = t("ConnectingtoICAOservice"));
        }
        case 1: {
          const response = await window.GetWebCameProvider().IsServiceHealthy();
          if (response && response.Result) {
            icaoStatusInstructions.style.display = "none";
            connectCameraBtn.disabled = false;
            // reconnect camera if not connected
            if (!isICAOSeriveActive) {
              connectCamera(cachedCamera);
              setIsICAOSeriveActive(true);
            }
            return (lblMessageErrorElm.innerText = t("ICAOserviceisConnected"));
          } else {
            icaoStatusInstructions.style.display = "flex";
            connectCameraBtn.disabled = true;
            captureImageBtn.disabled = true;
            return (lblMessageErrorElm.innerText = response.Message);
          }
        }
        case 2: {
          icaoStatusInstructions.style.display = "flex";
          connectCameraBtn.disabled = true;
          captureImageBtn.disabled = true;

          return (lblMessageErrorElm.innerText = t(
            "ReconnectingtoICAOservice"
          ));
        }
        case 4: {
          icaoStatusInstructions.style.display = "flex";
          connectCameraBtn.disabled = true;
          captureImageBtn.disabled = true;

          return (lblMessageErrorElm.innerText = t(
            "ICAOserviceisdisconnected"
          ));
        }
        default:
      }
    }, 1000);
  }
}

export const connectwithCameraFromLocalStorage = () => {
  const avaliableCamerasSelect =
    icaoAppWC.shadowRoot.getElementById("cbAvaliableCameras");
  const selecetedCameraIDFromLocalStorage = getSelectedCameraFromLocalStorage();
  if (selecetedCameraIDFromLocalStorage === "-1") {
    const firstAvailableCamera = Object.values(avaliableCameras[0])[0];
    avaliableCamerasSelect.value = firstAvailableCamera;
    addSelectedCameraToLocalStorage(firstAvailableCamera);
  } else {
    avaliableCamerasSelect.value = selecetedCameraIDFromLocalStorage;
  }

  connectCamera(selecetedCameraIDFromLocalStorage);
};
export function handleChangeInAvaliableCameras(selectedValue) {
  console.log("handle Change In Avaliable Cameras");
  // console.log("avaliableCameras", avaliableCameras);
  // console.log(e.target.value);

  // addDataIntoCache(
  //   "ConnectedCamera",
  //   window.location.protocol + "//" + window.location.host,
  //   e.target.value,
  //   60
  // );

  // TODO: caheck the value of e.target.value to be camera id

  console.log(
    "handleChangeInAvaliableCameras (handleChangeInAvaliableCameras):",
    selectedValue
  );
  addSelectedCameraToLocalStorage(selectedValue);

  setSelectedCamera(selectedValue);
  setCachedCamera(selectedValue);
  // connectCamera(e.target.value);
}

let showSelectedCamera;
const setShowSelectedCamera = () => {};
export function toggleAvailableCams() {
  setShowSelectedCamera(!showSelectedCamera);
}
// handel fullscreen mode enter and exit
// const [isFullScreen, setIsFullScreen] = useState(false); // state to keep track of whether the fullscreen mode is on or off
let isFullScreen;
const setIsFullScreen = () => {};
// useeffect to listen to the fullscreenchange event
// useEffect(() => {
//   // add event listener for the fullscreenchange event
//   icaoAppWC.shadowRoot.addEventListener("fullscreenchange", handleFullScreenChange);

//   // cleanup the event listener on unmount
//   return () => {
//     icaoAppWC.shadowRoot.removeEventListener("fullscreenchange", handleFullScreenChange);
//   };
// }, []);

// function to handle the fullscreen change event
export function handleFullScreenChange() {
  // check if the icaoAppWC.shadowRoot is in fullscreen mode
  if (icaoAppWC.shadowRoot.fullscreenElement) {
    setIsFullScreen(true);
    addFullscreenStyles();
  } else {
    setIsFullScreen(false);
    removeFullscreenStyles();
  }
  setDataContainerSize();
}

// // add useEffect to listen to the esc key press and the f key press
// useEffect(() => {
//   icaoAppWC.shadowRoot.addEventListener("keydown", handleKeyDown);
//   return () => {
//     icaoAppWC.shadowRoot.removeEventListener("keydown", handleKeyDown);
//   };
// }, []);

// function to handle the keydown event
export function handleKeyDown(e) {
  console.log(e.key);
  console.log("handleKeyDown is called");
  if (e.key === "Escape") {
    console.log("escape is pressed");
    if (isFullScreen) {
      toggleFullScreen();
    }
  } else if (e.key === "f") {
    toggleFullScreen();
  }
}

// function to toggle the fullscreen mode
export function toggleFullScreen() {
  if (!icaoAppWC.shadowRoot.fullscreenElement) {
    icaoContainer
      .requestFullscreen()
      .then(() => {
        setIsFullScreen(true);
        // addFullscreenStyles();
      })
      .catch((err) => {
        console.log(err);
        alert(
          `Error attempting to enable fullscreen mode: ${err.message} (${err.name})`
        );
      });
  } else {
    document
      .exitFullscreen()
      .then(() => setIsFullScreen(false))
      .catch((err) => {
        console.log(err);
        alert(
          `Error attempting to exit fullscreen mode: ${err.message} (${err.name})`
        );
      });
    setIsFullScreen(false);
  }
}

// function to add the fullscreen styles
export function addFullscreenStyles() {
  // console.log("addFullscreenStyles()");
  const iconSvgContainer = icaoAppWC.shadowRoot.querySelectorAll(
    ".icon-svg-container"
  );
  iconSvgContainer.forEach((icon) => {
    icon.classList.add("icon-svg-container-fullscreen");
  });
  // setDataContainerSize();
}

export function setDataContainerSize() {
  // console.log("setDataContainerSize()");
  const dataContainer = icaoAppWC.shadowRoot.querySelector(".data-conatiner");
  dataContainer.classList.toggle("data-conatiner-fullscreen");
}

// function to remove the fullscreen styles
export function removeFullscreenStyles() {
  // console.log("removeFullscreenStyles()");
  const iconSvgContainer = icaoAppWC.shadowRoot.querySelectorAll(
    ".icon-svg-container"
  );
  iconSvgContainer.forEach((icon) => {
    icon.classList.remove("icon-svg-container-fullscreen");
  });

  // setDataContainerSize();
}

// const [lableMessageForICAO, setLableMessageForICAO] = useState(false);

// function to store the selected camera in local storage:
export const addSelectedCameraToLocalStorage = (selecetedCameraID) => {
  const firstAvailableCamera = Object.values(avaliableCameras[0])[0];
  if (selecetedCameraID === "-1") {
    localStorage.setItem("icaoSelectedCamera", firstAvailableCamera);
  } else {
    localStorage.setItem("icaoSelectedCamera", selecetedCameraID);
  }
};

// function to get the stored camera from local storage:
export const getSelectedCameraFromLocalStorage = () => {
  const selectedCameraID = localStorage.getItem("icaoSelectedCamera");
  // console.log("Get selectedCameraID", selectedCameraID);
  if (selectedCameraID) {
    return selectedCameraID;
  } else {
    return "-1";
  }
};

export let utils = { CheckingICAOServiceThread };
