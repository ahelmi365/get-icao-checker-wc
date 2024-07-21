// #region Imports
// import "./utils.js";
// Function to dynamically import the module

// #endregion

// #region Bootstrap tootltip setup
// Enable bootstrap tooltip
const tooltipTriggerList = document.querySelectorAll(
  '[data-bs-toggle="tooltip"]'
);
const tooltipList = [...tooltipTriggerList].map(
  (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
);
// #endregion
// #region UseEffects
// ---------------- apply effects ----------------------
export const onICAOScriptLoad = async (
  isICAOWC,
  savedImageElm,
  setSavedImgSrc
) => {
  var {
    CaptureImage,
    ClearICAOServiceThread,
    ConnectCamera,
    EnrolmentDevices,
    FaceDetectedRectangleDrawingThread,
    GetConnectionState,
    Reconnect,
    RetrieveScripts,
    SaveCaptureedImg,
    StopCameraIndicatorInBrowser,
    StopCheckingICAOServiceThread,
    cachedCamera,
    connectwithCameraFromLocalStorage,
    enumerateDevices,
    getSelectedCameraFromLocalStorage,
    handleChangeInAvaliableCameras,
    handleFullScreenChange,
    isCheckingICAOServiceThread,
    isICAO,
    reestCashedArray,
    setCachedCamera,
    setIsCheckingICAOServiceThread,
    setLableMessageForICAO,
    stopVideoStream,
    toggleFullScreen,
    utilsCommonVars,
    onLoadUtils,
    utils,
  } = await import("./utils.js");

  isICAO = isICAOWC;
  utilsCommonVars.isICAO = isICAOWC;
  onLoadUtils();

  reestCashedArray();
  setIsCheckingICAOServiceThread(true);
  document.addEventListener("fullscreenchange", handleFullScreenChange);
  // document.addEventListener("keydown", handleKeyDown);
  if (isICAO) {
    try {
      RetrieveScripts(EnrolmentDevices.WebCam.Scripts);
    } catch (error) {
      console.log(error);
    }
  }

  const selecetedCameraIDFromLocalStorage = getSelectedCameraFromLocalStorage();
  setCachedCamera(selecetedCameraIDFromLocalStorage);
  enumerateDevices(selecetedCameraIDFromLocalStorage);

  if (isCheckingICAOServiceThread && isICAO) {
    ClearICAOServiceThread(utils.CheckingICAOServiceThread);
    utils.CheckingICAOServiceThread = setInterval(() => {
      if (isCheckingICAOServiceThread && isICAO) {
        GetConnectionState().then((ConnectionState) => {
          setLableMessageForICAO(ConnectionState);
          const lblMessageError = document.getElementById("lblMessageForICAO");
          lblMessageError
            ? (lblMessageError.innerText = ConnectionState)
            : null;

          // $("#lblMessageForICAO")?.text(ConnectionState);
        });
      }
    }, 1000);
  } else {
    ClearICAOServiceThread(utils.CheckingICAOServiceThread);
  }

  // #endregion
  // #region HTML elements
  const modalCloseBtn = document.getElementById("top-row-close-icon");
  const croppedImage = document.getElementById("cropped");
  croppedImage.src = "";
  croppedImage.style.display = "none";
  const connectCameraBtn = document.getElementById("connect-camera-btn");
  const captureImageBtn = document.getElementById("capture-image-btn");
  const enumerateDevicesBtn = document.getElementById("enumerate-devices-btn");
  const avaliableCamerasSelect = document.getElementById("cbAvaliableCameras");
  const saveImageBtn = document.getElementById("save-image");
  const toggleFullScreenBtn = document.querySelector(".toggle-full-screen");
  const openFullScreenBtn = document.getElementById("open-full-screen");
  const closeFullScreenBtn = document.getElementById("close-full-screen");
  closeFullScreenBtn.style.display = "none";
  const reconnectIcaoBtn = document.getElementById("reconnect-icao-btn");

  const saveCroppedImageContainer = document.getElementById(
    "save-captured-image-btn-container"
  );
  saveCroppedImageContainer.style.display = "none";
  // #endregion

  let isFullScreen = false;

  // #region events

  avaliableCamerasSelect.addEventListener("change", (e) => {
    connectwithCameraFromLocalStorage();
    handleChangeInAvaliableCameras(e);
  });

  saveImageBtn.addEventListener("click", () => {
    SaveCaptureedImg(savedImageElm, setSavedImgSrc);
  });
  reconnectIcaoBtn.addEventListener("click", () => {
    Reconnect();
  });

  toggleFullScreenBtn.addEventListener("click", () => {
    console.log("toggleFullScreenBtn is clicked");
    isFullScreen = !isFullScreen;
    toggleFullScreen();
    if (isFullScreen && !document.fullscreenElement) {
      openFullScreenBtn.style.display = "none";
      closeFullScreenBtn.style.display = "block";
    } else {
      closeFullScreenBtn.style.display = "none";
      openFullScreenBtn.style.display = "block";
    }
  });

  enumerateDevicesBtn.addEventListener("click", () => {
    console.log("enumerateDevicesBtn is clicked");

    enumerateDevices(cachedCamera);
  });
  connectCameraBtn.addEventListener("click", () => {
    console.log("connectCameraBtn is clicked");
    saveCroppedImageContainer.style.display = "none";
    const selecetedCameraIDFromLocalStorage =
      getSelectedCameraFromLocalStorage();
    try {
      ConnectCamera(selecetedCameraIDFromLocalStorage);
    } catch (error) {
      console.log(error);
    }
  });

  captureImageBtn.addEventListener("click", () => {
    console.log("captureImageBtn is clicked");
    CaptureImage();
  });

  modalCloseBtn.addEventListener("click", () => {
    console.log("close btn clicked");
    //   setShowICAOModal(false);
    if (document.fullscreenElement) {
      document.exitFullscreen();
      closeFullScreenBtn.style.display = "none";
      openFullScreenBtn.style.display = "block";
      //   setIsFullScreen(false);
    }
    // stopVideoStream();
    // StopCameraIndicatorInBrowser();
    // StopCheckingICAOServiceThread();
    // document.getElementById("icao-modal-start-container").style.display =
    //   "none";
    // removeScript("./scripts/script.js");
    // removeStyleSheet("./styles/styles.css");

    clearInterval(FaceDetectedRectangleDrawingThread);
  });

  if (isICAO) {
    croppedImage.classList.add("icao-img-width");
    croppedImage.classList.remove("no-icao-width");
  } else {
    croppedImage.classList.add("no-icao-width");
    croppedImage.classList.remove("icao-img-width");
  }
};
