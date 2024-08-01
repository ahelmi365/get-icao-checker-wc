const languages = {
  en: {
    ModalTitle: "Capture Photo",
    IcaoErrorMessage: "Failed to detect the face correctly, please try again",
    Capture: "Capture",
    NoFacesDetected: "No Faces Detected",
    "No faces detected": "No Faces Detected",
    Reconnect: "Reconnect",
    "Available Cameras": "Available Cameras",
    GetDevices: "Get Devices",
    Connect: "Connect",
    Save: "Save",
    "ICAO Checking": "ICAO Checking",
    Feature: "Feature",
    Dependencies: "Dependencies",
    Rangecompliance: "Range compliance",
    ICAOStatus: "ICAO Status",
    "Capture Area": "Capture Area",
    WebCamserviceisnotstarted: "ICAO service is not started",
    ConnectingtoICAOservice: "Connecting to ICAO service",
    ICAOserviceisConnected: "ICAO service is connected",
    ReconnectingtoICAOservice: "Reconnecting to ICAO service",
    ICAOserviceisdisconnected: "ICAO service is disconnected",
    pleaseclickbtn: "Please click the button to reconnect",
    connecticao: "Connect to ICAO",
    connectcameradevice:
      "Please make sure to connect the camera device to start the ICAO checker",
    compatible: "Compatible",
    incompatible: "Incompatible",
    the: "The",
    is: "is",
    toolow: "Too Low",
    toohigh: "Too High",
    inrange: "In Range",
    pleasecheckspec:
      "Please check the {{FaceAttributeIdStr}} to match ICAO Specifications.",
    icaostatus: "The ICAO Status is",
    cameranotallowed: "CameraPermission denied",
    selectcamera: "Select Camera",
  },
  es: {
    ModalTitle: "Capturar Foto",
    IcaoErrorMessage:
      "Error al detectar la cara correctamente, por favor intente de nuevo",
    Capture: "Capturar",
    NoFacesDetected: "No Caras Detectadas",
    "No faces detected": "No Caras Detectadas",
    Reconnect: "Reconectar",
    AvailableCameras: "Cámaras Disponibles",
    GetDevices: "Obtener Dispositivos",
    Connect: "Conectar",
    Save: "Guardar",
    ICAOChecking: "Verificación ICAO",
    Feature: "Característica",
    Dependencies: "Dependencias",
    Rangecompliance: "Cumplimiento de rango",
    ICAOStatus: "Estado ICAO",
    CaptureArea: "Área de captura",

    WebCamserviceisnotstarted: "El servicio ICAO no está iniciado",
    ConnectingtoICAOservice: "Conectando al servicio ICAO",
    ICAOserviceisConnected: "El servicio ICAO está conectado",
    ReconnectingtoICAOservice: "Reconectando al servicio ICAO",
    ICAOserviceisdisconnected: "El servicio ICAO está desconectado",
    pleaseclickbtn: "Por favor, haga clic en el botón para reconectar",
    connecticao: "Conectar a ICAO",
    connectcameradevice:
      "Por favor, asegúrese de conectar el dispositivo de cámara para iniciar el verificador ICAO",
    compatible: "Compatible",
    incompatible: "Incompatible",
    the: "El",
    is: "es",
    toolow: "Demasiado bajo",
    toohigh: "Demasiado alto",
    inrange: "Dentro del rango",
    pleasecheckspec:
      "Por favor, verifique que {{FaceAttributeIdStr}} coincida con las especificaciones de la OACI.",
    icaostatus: "El estado de la OACI es",
    cameranotallowed: "Permiso de cámara denegado",
    selectcamera: "Seleccionar cámara",
  },
};

export const t = (key, varName = "") => {
  const lang = window.icaoAppWC?.language;
  if (!languages.hasOwnProperty(lang)) {
    return languages["en"][key] ? languages["en"][key] : key;
  }

  if (varName === "") {
    return languages[lang][key] ? languages[lang][key] : key;
  } else {
    const translatedText = languages[lang][key];
    if (translatedText) {
      const textBeforeVarname = translatedText.split("{{")[0];
      const textAfterVarname = translatedText.split("}}")[1];
      const wholeText = `${textBeforeVarname}${varName}${textAfterVarname}`;
      return wholeText;
    } else {
      return key;
    }
  }
};

// console.log(t("pleasecheckspec", "EyeGaze"));
