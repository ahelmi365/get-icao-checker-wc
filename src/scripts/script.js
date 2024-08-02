// #region Imports

// ---------------- apply effects ----------------------
export const onICAOScriptLoad = async (getImgSrc) => {
  var {
    captureImage,
    connectCamera,
    EnrolmentDevices,
    getICAOServiceConnectionState,
    reconnect,
    retrieveScripts,
    saveCaptureedImg,
    cachedCamera,
    connectwithCameraFromLocalStorage,
    enumerateDevices,
    getSelectedCameraFromLocalStorage,
    handleChangeInAvaliableCameras,
    handleFullScreenChange,
    reestCashedArray,
    setCachedCamera,
    setIsCheckingICAOServiceThread,
    toggleFullScreen,
    onLoadUtils,
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
      retrieveScripts(EnrolmentDevices.WebCam.Scripts);
    } catch (error) {
      console.log(error);
    }
  }

  const selecetedCameraIDFromLocalStorage = getSelectedCameraFromLocalStorage();

  setCachedCamera(selecetedCameraIDFromLocalStorage);

  enumerateDevices(selecetedCameraIDFromLocalStorage);

  getICAOServiceConnectionState();

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
    clearInterval(icaoAppWC.grapFrameIntervalId);

    clearInterval(icaoAppWC.icaoServiceConnectionStateIntervalId);
    icaoAppWC.icaoServiceConnectionStateIntervalId = null;
    setIsCheckingICAOServiceThread(false);
    window.dispatchEvent(new Event("icao-hidden.bs.modal"));
  }
  saveImageBtn.addEventListener("click", () => {
    saveCaptureedImg(getImgSrc);
    closeICAOModal();
  });
  reconnectIcaoBtn.addEventListener("click", () => {
    reconnect();
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
      console.log(
        "calling connectCamera() from scripts on connectBTN is clicked"
      );
      connectCamera(selecetedCameraIDFromLocalStorage);
      // getICAOServiceConnectionState();
    } catch (error) {
      console.log(error);
    }
  });

  captureImageBtn.addEventListener("click", () => {
    console.log("captureImageBtn is clicked");
    captureImage();
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
