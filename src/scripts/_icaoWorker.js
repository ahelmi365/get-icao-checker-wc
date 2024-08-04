self.addEventListener("message", (event) => {
  const { base64Src } = event.src;
  console.log({ base64Src });
  //   webCamDevice.ICOAChecking(base64Src);
});
