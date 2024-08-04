import { LitElement } from "lit";

// import {html, render} from 'https://esm.run/lit-html@1';
// import { htmlTemplate } from "./scripts/htmlTemplate.js";
const webCamScriptDomainName = "http://localhost:9002";
window.icaoAppWC = {
  isICAO: false,
  shadowRoot: null,
  language: "en",
  savedImageElm: null,
  openModalElmId: "",
  getImgSrc: null,
};

window.EnrolmentDevices = {
  WebCam: {
    Scripts: [
      `${webCamScriptDomainName}/scripts/jquery-1.6.4.min.js`,
      `${webCamScriptDomainName}/scripts/getsoass.js`,
      `${webCamScriptDomainName}/scripts/jquery.signalR-1.2.2.js`,
      `${webCamScriptDomainName}/scripts/hub.js`,
    ],
  },
};
const initICAOModal = async (shadwoRoot) => {
  const htmlModule = await import("./scripts/htmlTemplate.js");
  const clonedIcaoHTML = htmlModule.htmlTemplate.content.cloneNode(true);

  // Create modal structure
  const modal = document.createElement("div");
  modal.id = "icao-modal-start-container";

  modal.appendChild(clonedIcaoHTML);

  // Append modal to the regular DOM

  shadwoRoot.appendChild(modal);
};

export class GetIcaoCheckerWc extends LitElement {
  static get properties() {
    return {
      isICAOWC: { type: Boolean },
      language: { type: String },
      openModalElmId: { type: String },
      savedImageElmId: { type: String },
      getImgSrc: { type: Function },
    };
  }

  constructor() {
    super();
    console.log("constructor version 1.6.4");

    this.isICAOWC = false;
    this.language = "en";
    this.openModalElmId = "";
    this.savedImageElmId = "";
    this.getImgSrc = (src) => console.log({ src });

    this.icaoRoot = this.attachShadow({ mode: "open" });
    icaoAppWC.shadowRoot = this.icaoRoot;
  }
  handleBeforeUnload = (icaoRoot) => {
    EnrolmentDevices.WebCam.Scripts.map((script) => {
      // removeScript(script);
      const scriptToRemove = icaoRoot.querySelector(`script[src="${script}"]`);

      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    });
    // delete window.icaoAppWC;
    // delete window.EnrolmentDevices;
  };
  async connectedCallback() {
    icaoAppWC.isICAO = this.hasAttribute("isICAOWC");
    icaoAppWC.language = this.getAttribute("language") || "en";
    icaoAppWC.openModalElmId = this.getAttribute("openModalElmId");
    icaoAppWC.getImgSrc = this.getImgSrc;
    icaoAppWC.savedImageElm = document.getElementById(
      this.getAttribute("savedImageElmId")
    );

    await initICAOModal(this.icaoRoot);
    try {
      const openModalBtn = document.getElementById(icaoAppWC.openModalElmId);

      if (!openModalBtn) {
        throw new Error(
          `No element found to open the ICAO Modal, please check the value of the 'openModalElmId' attribute`
        );
      } else {
        openModalBtn.addEventListener(
          "click",
          this.openModalAndoadIcaoScripts.bind(this)
        );
      }
    } catch (error) {
      alert(error);
      console.error(error);
    }

    // handle saved image id
    window.addEventListener(
      "beforeunload",
      this.handleBeforeUnload(this.icaoRoot)
    );
  }

  async openModalAndoadIcaoScripts() {
    this.shadowRoot
      .querySelector(".icao-modal-container")
      .classList.add("show");
    // this.openModal(this);
    const { onICAOScriptLoad } = await import("./scripts/script.js");
    onICAOScriptLoad(this.getImgSrc);

    window.addEventListener("icao-hidden.bs.modal", async () => {
      const {
        reestCashedArray,
        stopVideoStream,
        clearICAOServiceThread,
        utils,
      } = await import("./scripts/utils.js");
      // StopWorker();
      reestCashedArray();
      stopVideoStream();
      clearICAOServiceThread(utils.CheckingICAOServiceThread);

      window.stream = null;
    });
  }

  disconnectedCallback() {
    console.log("disconnectedCallback()");
  }
}
