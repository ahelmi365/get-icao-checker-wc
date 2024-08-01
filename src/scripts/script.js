// #region Imports
// import "./utils.js";
// Function to dynamically import the module

// #endregion

// #region Bootstrap tootltip setup
// Enable bootstrap tooltip
// const tooltipTriggerList = icaoAppWC.shadowRoot.querySelectorAll(
//   '[data-bs-toggle="tooltip"]'
// );
// const tooltipList = [...tooltipTriggerList].map(
//   (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
// );
// #endregion
// #region UseEffects
// ---------------- apply effects ----------------------
export const onICAOScriptLoad = async (getImgSrc) => {
  var {
    CaptureImage,
    ClearICAOServiceThread,
    ConnectCamera,
    EnrolmentDevices,
    grapFrameIntervalId: FaceDetectedRectangleDrawingThread,
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
    reestCashedArray,
    setCachedCamera,
    setIsCheckingICAOServiceThread,
    setLableMessageForICAO,
    stopVideoStream,
    toggleFullScreen,
    onLoadUtils,
    utils,
  } = await import("./utils.js");

  onLoadUtils();

  reestCashedArray();
  setIsCheckingICAOServiceThread(true);
  icaoAppWC.shadowRoot.addEventListener(
    "fullscreenchange",
    handleFullScreenChange
  );
  // icaoAppWC.shadowRoot.addEventListener("keydown", handleKeyDown);
  if (icaoAppWC.isICAO) {
    try {
      RetrieveScripts(EnrolmentDevices.WebCam.Scripts);
    } catch (error) {
      console.log(error);
    }
  }

  const selecetedCameraIDFromLocalStorage = getSelectedCameraFromLocalStorage();
  setCachedCamera(selecetedCameraIDFromLocalStorage);
  enumerateDevices(selecetedCameraIDFromLocalStorage);
  if (isCheckingICAOServiceThread && icaoAppWC.isICAO) {
    ClearICAOServiceThread(utils.CheckingICAOServiceThread);
    utils.CheckingICAOServiceThread = setInterval(() => {
      if (isCheckingICAOServiceThread && icaoAppWC.isICAO) {
        GetConnectionState().then((ConnectionState) => {
          setLableMessageForICAO(ConnectionState);
          const lblMessageError =
            icaoAppWC.shadowRoot.getElementById("lblMessageForICAO");
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
  const modalCloseBtn =
    icaoAppWC.shadowRoot.getElementById("top-row-close-icon");
  const croppedImage = icaoAppWC.shadowRoot.getElementById("cropped");
  croppedImage.src = "";
  croppedImage.style.display = "none";
  const connectCameraBtn =
    icaoAppWC.shadowRoot.getElementById("connect-camera-btn");
  const captureImageBtn =
    icaoAppWC.shadowRoot.getElementById("capture-image-btn");
  const enumerateDevicesBtn = icaoAppWC.shadowRoot.getElementById(
    "enumerate-devices-btn"
  );
  const avaliableCamerasSelect =
    icaoAppWC.shadowRoot.getElementById("cbAvaliableCameras");

  const saveImageBtn = icaoAppWC.shadowRoot.getElementById("save-image");
  const toggleFullScreenBtn = icaoAppWC.shadowRoot.querySelector(
    ".toggle-full-screen"
  );
  const openFullScreenBtn =
    icaoAppWC.shadowRoot.getElementById("open-full-screen");
  const closeFullScreenBtn =
    icaoAppWC.shadowRoot.getElementById("close-full-screen");
  closeFullScreenBtn.style.display = "none";
  const reconnectIcaoBtn =
    icaoAppWC.shadowRoot.getElementById("reconnect-icao-btn");

  const saveCroppedImageContainer = icaoAppWC.shadowRoot.getElementById(
    "save-captured-image-btn-container"
  );
  saveCroppedImageContainer.style.display = "none";
  // #endregion

  let isFullScreen = false;

  // #region events

  avaliableCamerasSelect.addEventListener("change", function (e) {
    const selectedValue = this.value;
    console.log({ selectedValue });

    connectwithCameraFromLocalStorage();
    handleChangeInAvaliableCameras(selectedValue);
  });
  function closeICAOModal() {
    if (icaoAppWC.shadowRoot.fullscreenElement) {
      document.exitFullscreen();
      closeFullScreenBtn.style.display = "none";
      openFullScreenBtn.style.display = "block";
    }

    icaoAppWC.shadowRoot
      .querySelector(".icao-modal-container")
      .classList.remove("show");
    clearInterval(FaceDetectedRectangleDrawingThread);
    window.dispatchEvent(new Event("icao-hidden.bs.modal"));
  }
  saveImageBtn.addEventListener("click", () => {
    SaveCaptureedImg(getImgSrc);
    closeICAOModal();
  });
  reconnectIcaoBtn.addEventListener("click", () => {
    Reconnect();
  });

  toggleFullScreenBtn.addEventListener("click", () => {
    console.log("toggleFullScreenBtn is clicked");
    isFullScreen = !isFullScreen;
    toggleFullScreen();
    if (isFullScreen && !icaoAppWC.shadowRoot.fullscreenElement) {
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
    closeICAOModal();
  });

  if (icaoAppWC.isICAO) {
    croppedImage.classList.add("icao-img-width");
    croppedImage.classList.remove("no-icao-width");
  } else {
    croppedImage.classList.add("no-icao-width");
    croppedImage.classList.remove("icao-img-width");
  }
};
