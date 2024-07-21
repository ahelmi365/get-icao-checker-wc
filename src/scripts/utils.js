import {
  StartWorker,
  StopWorker,
  UpdateIsIcaoCheckRunning,
} from "./ICAOWorker.js";

// import "./index.js";
export const utilsCommonVars = {
  isICAO: true,
  isPhotoCaptured: false,
  isDeviceAvailable: true,
};
const icaoCheckerElement = document.querySelector("icao-checker-wc");
// set the backendURL
const webCamScriptDomainName = "http://localhost:9002";
const backendURL = "http://localhost:9002";
export var isICAO = false;

const IcaoAttributesValues = {
  TOO_LOW: "TooLow",
  TOO_HIGH: "TooHigh",
  IN_RANGE: "InRange",
  COMPATIBLE: "Compatible",
  IN_COMPATIBLE: "Incompatible",
  DEFAULT: "No-Status",
};
const icaoStatusInstructions = document.getElementById(
  "icao-status-instructions"
);
if (icaoStatusInstructions) {
  icaoStatusInstructions.style.display = "none";
}

export const EnrolmentDevices = {
  WebCam: {
    Scripts: [
      `${webCamScriptDomainName}/scripts/jquery-1.6.4.min.js`,
      `${webCamScriptDomainName}/scripts/getsoass.js`,
      `${webCamScriptDomainName}/scripts/jquery.signalR-1.2.2.js`,
      `${webCamScriptDomainName}/scripts/hub.js`,
    ],
  },
};

// const leftFeatures = document.getElementById("left-features");
const leftFeatures = document.getElementById("left-features");
const rightFeatures = document.getElementById("right-features");
const leftAndRightFeatures = [
  ...leftFeatures.children,
  ...rightFeatures.children,
];
// if (!utilsCommonVars.isICAO) {
//   console.log("utilsCommonVars.isICAO", utilsCommonVars.isICAO);
//   leftFeatures.style.display = "none";
//   rightFeatures.style.display = "none";
// }
const connectCameraBtnContainer = document.getElementById(
  "connect-camera-btn-container"
);
const captureImageBtnContainer = document.getElementById(
  "capture-image-btn-container"
);
const saveCroppedImageContainer = document.getElementById(
  "save-captured-image-btn-container"
);
saveCroppedImageContainer.style.display = "none";
const connectCameraBtn = document.getElementById("connect-camera-btn");
const captureImageBtn = document.getElementById("capture-image-btn");

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
  //   avaliableCameras.push(newCamera);
};

let pausedRequested = false;
export let webCamDevice = null;
let serviceProxyForWebCam;

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
export let isDeviceConnected;
const setIsDeviceConnected = () => {};
// const CheckingICAOServiceThread = useRef();
var CheckingICAOServiceThread = null;
// const [isCheckingICAOServiceThread, setIsCheckingICAOServiceThread] = useState(true);
export var isCheckingICAOServiceThread = true;
export const setIsCheckingICAOServiceThread = (value) => {
  isCheckingICAOServiceThread = value;
};

// const FaceDetectedRectangleDrawingThread = useRef(null);
export let FaceDetectedRectangleDrawingThread;
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
  if (utilsCommonVars.isICAO) {
    leftFeatures.classList.add("flex-column-space-around-center");
    leftFeatures.classList.remove("d-none");
    rightFeatures.classList.add("flex-column-space-around-center");
    rightFeatures.classList.remove("d-none");
  }
};

// #region functions
// enumerateDevices
export function enumerateDevices(cachedConnectedCamera) {
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
            document.getElementById("cbAvaliableCameras");

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
          SetCachedConnectedCamera(avCameras, cachedConnectedCamera);
          connectwithCameraFromLocalStorage();
          stream.getTracks().forEach((track) => {
            track.stop();
          });
          // ConnectCamera(cachedConnectedCamera);
          const selecetedCameraIDFromLocalStorage =
            getSelectedCameraFromLocalStorage();
          try {
            ConnectCamera(selecetedCameraIDFromLocalStorage);
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
      alert(err);
    });
}

// SetCachedConnectedCamera
export function SetCachedConnectedCamera(avCameras, cachedConnectedCamera) {
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

// StopCheckingICAOServiceThread
export function StopCheckingICAOServiceThread() {
  ClearICAOServiceThread();
  setIsCheckingICAOServiceThread(false);
  StopCameraIndicatorInBrowser();

  FaceDetectedRectangleDrawingThread = null;
  window.stream = null;
}

// ClearICAOServiceThread
export function ClearICAOServiceThread(id) {
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
export function ConnectCamera(camera) {
  // console.log("ConnectCamera()");
  setIsLiveIcaoData(true);
  try {
    setIsPhotoCaptured(false);
    connectCameraBtnContainer.style.display = "none";
    captureImageBtnContainer.style.display = "flex";

    if (utilsCommonVars.isICAO) {
      webCamDevice = window.GetWebCameProvider();
      // {ICOAChecking: ƒ, IsServiceHealthy: ƒ, GetAndOpenDevice: ƒ, GetCropImage: ƒ}

      webCamDevice.onUpdateICAOCheck = function (IcaoResult) {
        UpdateIsIcaoCheckRunning(false);
        IcaoResult && IcaoResult.Success
          ? handleSuccessInICAOChecking(IcaoResult)
          : handleFailureInICAOChecking(IcaoResult);
      };

      StopWorker();
    }
    pausedRequested = false;
    StartVideo();
    // document.getElementById("btnSaveCaptureImage").disabled = true;
    if (utilsCommonVars.isICAO) {
      StartWorker();
    }
    setIsDeviceConnected(true);

    // document.getElementById("canvas").style.display = "inline"; // commented by Ali
    // const cameraCopy = JSON.parse(JSON.stringify(camera));
    document.getElementById("cropped").style.display = "none";
    // addDataIntoCache(
    //   "ConnectedCamera",
    //   window.location.protocol + "//" + window.location.host,
    //   camera,
    //   // cameraCopy,
    //   60
    // );
    addSelectedCameraToLocalStorage(camera);
  } catch (error) {
    console.log("error from connect camera", error);
  }
}

var resolutionWidth = 0;
var resolutionHeight = 0;

let preferredResolutions = [
  { width: 1920, height: 1080 },
  { width: 1280, height: 720 },
  { width: 640, height: 480 },
  // Add more resolutions as needed
];

// startVideo()
export async function StartVideo() {
  // console.log("Started the video"); // by Ali

  const video = document.getElementById("video");
  // method load() resets the media element to its initial state
  // and begins the process of selecting a media source and loading the media in preparation for playback
  // to begin at the beginning.
  video.load();

  const canvas = document.getElementById("canvas");
  canvas.width = resolutionWidth;
  canvas.height = resolutionHeight; //video.videoHeight;//"400";//

  // document.getElementById("video").style.display = "inline"; // by ali
  video.style.display = "inline"; // by ali

  // if ((<any>window).stream) {
  //   (<any>window).stream.getTracks().forEach(track => {
  // 	track.stop();
  //   });
  // }

  StopCameraIndicatorInBrowser(); // by Ali
  // if (window?.stream) {
  //   window?.stream.getTracks().forEach((track) => {
  //     track.stop();
  //   });
  // }

  const videoSource = selectedCamera;
  const constraints = {
    video: {
      deviceId: videoSource ? { exact: videoSource } : undefined,
    },
  };
  let mediaStream = null;
  try {
    for (let resolution of preferredResolutions) {
      constraints.video = {
        width: resolution.width,
        height: resolution.height,
      };

      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
        break; // Break out of the loop if successful
      } catch (error) {
        // Continue trying with the next resolution
      }
    }

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
    UpdateIsIcaoCheckRunning(false);
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

  clearInterval(FaceDetectedRectangleDrawingThread);
  FaceDetectedRectangleDrawingThread = null;

  FaceDetectedRectangleDrawingThread = setInterval(() => {
    if (window.stream) {
      // if (video.stream) {
      // by Ali
      // console.log("window.stream running");
      grapFrame();
    }
  }, 1000 / 30);
}
// a function to stop video streaming from user's camera
export function stopVideoStream() {
  console.log("stopVideoStream() is called");
  const videoElement = document.getElementById("video");
  const stream = videoElement.srcObject;
  const tracks = stream?.getTracks();
  if (!tracks) {
    return;
  }
  tracks.forEach(function (track) {
    track.stop();
  });

  videoElement.srcObject = null;
}

// grapFrame
export function grapFrame() {
  const video = document.getElementById("video");
  const canvas = document.getElementById("canvas");
  if (video) {
    // by Ali
    // canvas.width = video.videoWidth;
    // canvas.height = "400"; //video.videoHeight;//"400";//
    canvas.width = resolutionWidth;
    canvas.height = resolutionHeight;

    const ctx = canvas.getContext("2d");

    if (!pausedRequested) {
      // canvas.width = video.videoWidth;
      // canvas.height = "400"; //video.videoHeight; //"400"; //
      canvas.width = resolutionWidth;
      canvas.height = resolutionHeight;
      ctx.drawImage(video, 0, 0, resolutionWidth, resolutionHeight);
      //if (FaceFeatures[0]) {
      // ctx.strokeStyle = 'green';
      // ctx.lineWidth = 3;
      // var p0 = FaceFeatures[0].faceCropRectangle[0];
      // var p1 = FaceFeatures[0].faceCropRectangle[1];
      // var p2 = FaceFeatures[0].faceCropRectangle[2];
      // var p3 = FaceFeatures[0].faceCropRectangle[3];
      // ctx.beginPath();
      // ctx.moveTo(p0.X, p0.Y);
      // ctx.lineTo(p1.X, p1.Y);
      // ctx.lineTo(p3.X, p3.Y);
      // ctx.lineTo(p2.X, p2.Y);
      // ctx.closePath();
      // ctx.stroke();
      //}
      // setTimeout(grapFrame, 1000 / 30);
    } else {
      pausedRequested = true;
    }
  }
}

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
    displayICAOCheckingMessage(rollPitchYawErrorMessage);
    setIsDeviceConnected(false);
  }
};
// showYawRollPitchErrorMessage
const rollPitchYawErrorMessage =
  "Failed to detect the face correctly, please look at the camera and try capturing again";
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
  const tooltipInstance = bootstrap.Tooltip.getInstance(
    `#${toolTipId.toLowerCase()}`
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
        ? `<span class="red-font">Too Low</span>`
        : icaoItem.FaceAttributeRangeStatus === IcaoAttributesValues.TOO_HIGH
        ? `<span class="red-font">Too High</span>`
        : icaoItem.FaceAttributeRangeStatus === IcaoAttributesValues.IN_RANGE
        ? ` <span class="green-font">In Range</span>`
        : "not-found";

    const tooltipCompatabilityText =
      icaoItem.ICAOStatusStr === IcaoAttributesValues.COMPATIBLE
        ? ""
        : `<p class="white-font">Please check the ${icaoItem.FaceAttributeIdStr} to match ICAO Specifications.</p>`;

    const tooltipIcaoStatusText = `<p className="icao-card-details-item white-font"> 
    The ICAO Status is  <strong><span class= ${
      icaoItem.ICAOStatusStr === IcaoAttributesValues.COMPATIBLE
        ? "green-font"
        : "red-font"
    }>
                    ${icaoItem.ICAOStatusStr}
                  </span>
                </strong>
                .</p>`;

    tooltipInstance?.setContent({
      ".tooltip-inner": `<span class="icao-card-details-item white-font">The ${icaoItem.FaceAttributeIdStr} is <strong>${toolTipRangStatusText}</strong>.</span>
            ${tooltipIcaoStatusText}${tooltipCompatabilityText}`,
    });
  }
};
//  IsShowOnlyError() // to filter only error, not needed, commented by Ali
//  StyleICAOFeatureRow() // to draw the table, not needed , commented by Ali

// DisplayICAOCheckingMessage
export function displayICAOCheckingMessage(message) {
  // console.log("DisplayICAOCheckingMessage", message);
  // console.log("typeof message",  message.length);
  const divICAOCheckingMessage = document.getElementById(
    "divICAOCheckingMessage"
  );
  if (divICAOCheckingMessage) {
    divICAOCheckingMessage.style.display = "flex";
    // divICAOCheckingMessage.style.visibility = "visible";
    if (message != undefined && message.length > 0) {
      if (message !== divICAOCheckingMessage.innerText) {
        divICAOCheckingMessage.innerText = message;
      }
      captureImageBtn.disabled = true;
    } else {
      divICAOCheckingMessage.style.display = "none";
      captureImageBtn.disabled = false;
    }
    setIsDeviceConnected(false);
  }
}

export function RetrieveScripts(scriptsURL) {
  for (let i = 0; i < scriptsURL.length; i++) {
    const scriptToRemove = document.querySelector(
      `script[src="${scriptsURL[i]}"]`
    );
    if (!scriptToRemove) {
      let script = document.createElement("script");
      script.src = scriptsURL[i];
      script.async = false;
      document.body.appendChild(script);
    }
  }
}

// Reconnect
export async function Reconnect() {
  console.log("Reconnect ()");
  if (utilsCommonVars.isICAO) {
    if (serviceProxyForWebCam == null) {
      RetrieveScripts(EnrolmentDevices.WebCam.Scripts);
      console.log("serviceproxyforwebacm  = null");
    }
    try {
      console.log("Reconnect Try Block");
      serviceProxyForWebCam.Connection.start(
        { transport: ["webSockets"], waitForPageLoad: true },

        function () {
          console.log("connection re-established!");
        }
      ).done(function (result) {
        console.log("re-connecting is done!");
      });
    } catch (exe) {}
  }
}

//CaptureImage
export async function CaptureImage() {
  clearInterval(FaceDetectedRectangleDrawingThread);
  FaceDetectedRectangleDrawingThread = null;

  pausedRequested = true;
  StopWorker();
  const video = document.getElementById("video");
  video.pause();

  const canvas = document.getElementById("canvas");
  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0, resolutionWidth, resolutionHeight);

  const croppedimg = document.getElementById("cropped");
  if (utilsCommonVars.isICAO) {
    const GetCropImageResult = await window
      .GetWebCameProvider()
      .GetCropImage(canvas.toDataURL("image/jpeg", 1.0));

    if (GetCropImageResult) {
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

        video.style.display = "none"; // by ali
        canvas.style.display = "none"; // by ali
        croppedimg.style.display = "block"; // by ali
        croppedimg.animate(
          {
            opacity: 1,
          },
          500
        );

        // document.getElementById("canvas").style.display = "none";
        // document.getElementById("video").style.display = "none"; // by ali
        // document.getElementById("cropped").style.display = "block"; // from inline to block by ali
        icaoStatusInstructions.style.display = "none";
        connectCameraBtn.disabled = false;
        captureImageBtn.disabled = false;
        setIsDeviceConnected(false);
        setIsPhotoCaptured(true);
        connectCameraBtnContainer.style.display = "flex";
        captureImageBtnContainer.style.display = "none";
        saveCroppedImageContainer.style.display = "flex";
      };
      croppedimg.src = GetCropImageResult;

      // var btnSaveCaptureImage = document.getElementById("btnSaveCaptureImage");
      // btnSaveCaptureImage.disabled = false;

      // stopWindowStreaming(); // by Ali

      // Set window.stream to null
      stopVideoStream();
      window.stream = null; // by Ali

      setIsLiveIcaoData(false); // by Ali
    } else {
      displayICAOCheckingMessage("Cannot detect face");
      setIsPhotoCaptured(false);
      connectCameraBtnContainer.style.display = "none";
      captureImageBtnContainer.style.display = "flex";
    }
  } else {
    croppedimg.src = canvas.toDataURL("image/jpeg", 1.0);
    video.style.display = "none"; // by ali
    canvas.style.display = "none"; // by ali
    croppedimg.style.display = "block"; // by ali

    icaoStatusInstructions.style.display = "none";
    connectCameraBtn.disabled = false;
    captureImageBtn.disabled = false;
    setIsDeviceConnected(false);
    setIsPhotoCaptured(true);
    connectCameraBtnContainer.style.display = "flex";
    captureImageBtnContainer.style.display = "none";
    saveCroppedImageContainer.style.display = "flex";
    window.stream = null; // by Ali

    setIsLiveIcaoData(false); // by Ali
  }
}

// SaveCaptureedImg
export function SaveCaptureedImg(savedImageElm, setSavedImgSrc) {
  StopCameraIndicatorInBrowser();
  ClearICAOServiceThread();
  const croppedImage = document.getElementById("cropped");
  // updatePhotoImage(croppedImage.src);
  savedImageElm.src = croppedImage.src;
  if (typeof setSavedImgSrc === "function") {
    setSavedImgSrc(croppedImage.src);
  }
  stopVideoStream();
  croppedImage.style.display = "none";
}

// StopCameraIndicatorInBrowser
export function StopCameraIndicatorInBrowser() {
  if (window?.stream) {
    // stopVideoStream();
    window?.stream.getTracks().forEach((track) => {
      track.stop();
    });
  }
}

// GetConnectionState
export async function GetConnectionState() {
  if (utilsCommonVars.isICAO) {
    serviceProxyForWebCam = window.serviceProxyForWebCam;

    if (typeof serviceProxyForWebCam == "undefined") {
      icaoStatusInstructions.style.display = "flex";
      connectCameraBtn.disabled = true;
      captureImageBtn.disabled = true;
      return `${"WebCamserviceisnotstarted"}`;
    }
    console.log(serviceProxyForWebCam.Connection.state);
    switch (serviceProxyForWebCam.Connection.state) {
      case 0: {
        icaoStatusInstructions.style.display = "flex";
        connectCameraBtn.disabled = true;
        captureImageBtn.disabled = true;
        return `${"Connecting To ICAO Service..."}`;
      }
      case 1: {
        const response = await window.GetWebCameProvider().IsServiceHealthy();
        if (response && response.Result) {
          icaoStatusInstructions.style.display = "none";
          connectCameraBtn.disabled = false;
          // captureImageBtn.disabled = false;
          return `${"ICAO Service Is Connected"}`;
        } else {
          icaoStatusInstructions.style.display = "flex";
          connectCameraBtn.disabled = true;
          captureImageBtn.disabled = true;
          return response.Message;
        }
      }
      case 2: {
        icaoStatusInstructions.style.display = "flex";
        connectCameraBtn.disabled = true;
        captureImageBtn.disabled = true;

        return `${"Reconnecting To ICAO Service..."}`;
      }
      case 4: {
        icaoStatusInstructions.style.display = "flex";
        connectCameraBtn.disabled = true;
        captureImageBtn.disabled = true;

        return `${"ICAO Service Is Disconnected"}`;
      }
      default:
    }
  }
}

export const connectwithCameraFromLocalStorage = () => {
  const avaliableCamerasSelect = document.getElementById("cbAvaliableCameras");
  const selecetedCameraIDFromLocalStorage = getSelectedCameraFromLocalStorage();

  avaliableCamerasSelect.value = selecetedCameraIDFromLocalStorage;
  ConnectCamera(selecetedCameraIDFromLocalStorage);
};
export function handleChangeInAvaliableCameras(e) {
  // console.log("handle Change In Avaliable Cameras");
  // console.log("avaliableCameras", avaliableCameras);
  // console.log(e.target.value);

  // addDataIntoCache(
  //   "ConnectedCamera",
  //   window.location.protocol + "//" + window.location.host,
  //   e.target.value,
  //   60
  // );

  // TODO: caheck the value of e.target.value to be camera id
  // console.log(
  //   "handleChangeInAvaliableCameras (handleChangeInAvaliableCameras):",
  //   e.target.value
  // );
  addSelectedCameraToLocalStorage(e.target.value);

  setSelectedCamera(e.target.value);
  setCachedCamera(e.target.value);
  // ConnectCamera(e.target.value);
}

// useEffect to set setCashedCameraToSelect to the cashed camera when the component didunmount

// listen to the change in the selected camera
// useEffect(() => {
//   const selecetedCameraIDFromLocalStorage = getSelectedCameraFromLocalStorage();
//   try {
//     ConnectCamera(selecetedCameraIDFromLocalStorage);
//   } catch (error) {
//     console.log(error);
//   }
// }, [selectedCamera]);

// handle toggleAvailableCams
// const [showSelectedCamera, setShowSelectedCamera] = useState(true);
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
//   document.addEventListener("fullscreenchange", handleFullScreenChange);

//   // cleanup the event listener on unmount
//   return () => {
//     document.removeEventListener("fullscreenchange", handleFullScreenChange);
//   };
// }, []);

// function to handle the fullscreen change event
export function handleFullScreenChange() {
  // check if the document is in fullscreen mode
  if (document.fullscreenElement) {
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
//   document.addEventListener("keydown", handleKeyDown);
//   return () => {
//     document.removeEventListener("keydown", handleKeyDown);
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
  const icaoContainer = document.querySelector(".icao-container-modal");
  console.log({ icaoContainer });
  if (!document.fullscreenElement) {
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
  const iconSvgContainer = document.querySelectorAll(".icon-svg-container");
  iconSvgContainer.forEach((icon) => {
    icon.classList.add("icon-svg-container-fullscreen");
  });
  // setDataContainerSize();
}

export function setDataContainerSize() {
  // console.log("setDataContainerSize()");
  // const videoElement = document.getElementById("video");
  const dataContainer = document.querySelector(".data-conatiner");
  dataContainer.classList.toggle("data-conatiner-fullscreen");

  // const videoWidth = videoElement.clientWidth;

  // console.log("computedWidthOfVideo: ", videoWidth);
  // dataContainer.style.width = `${videoWidth}px`;
}

// function to remove the fullscreen styles
export function removeFullscreenStyles() {
  // console.log("removeFullscreenStyles()");
  const iconSvgContainer = document.querySelectorAll(".icon-svg-container");
  iconSvgContainer.forEach((icon) => {
    icon.classList.remove("icon-svg-container-fullscreen");
  });

  // setDataContainerSize();
}

// const [lableMessageForICAO, setLableMessageForICAO] = useState(false);

export let lableMessageForICAO;
export const setLableMessageForICAO = (newMEssage) => {
  lableMessageForICAO = newMEssage;
};

// function to store the selected camera in local storage:
export const addSelectedCameraToLocalStorage = (selecetedCameraID) => {
  // console.log("Add selecetedCameraID:", selecetedCameraID);
  localStorage.setItem("icaoSelectedCamera", selecetedCameraID);
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
