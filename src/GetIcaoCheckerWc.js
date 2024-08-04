import { html, css, LitElement } from "lit";
// import {html, render} from 'https://esm.run/lit-html@1';
// import { htmlTemplate } from "./scripts/htmlTemplate.js";

// #region Common JS

window.icaoAppWC = {
  isICAO: false,
  shadowRoot: null,
  language: "en",
  savedImageElm: null,
  openModalElmId: "",
  getImgSrc: null,
};

export function removeScript(src) {
  const scriptToRemove = document.querySelector(`script[src="${src}"]`);

  if (scriptToRemove) {
    scriptToRemove.remove();
  }
}
export function removeStyleSheet(href) {
  const styleSheetToRemove = document.querySelector(`link[href="${href}"]`);
  if (styleSheetToRemove) {
    styleSheetToRemove.remove();
  }
}

export function loadScript(src, shadowRoot) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
    } else {
      const script = document.createElement("script");
      script.src = src;
      script.type = "module";
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script ${src}`));
      // document.head.appendChild(script);
      shadowRoot.appendChild(script);
    }
  });
}

export function loadStyle(href, shadowRoot) {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`link[href="${href}"]`)) {
      resolve();
    } else {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load style ${href}`));
      // document.head.appendChild(link);
      shadowRoot.appendChild(link);
    }
  });
}

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

// #endregion
// #region inedx.js

// #endregion

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
    console.log("constructor version 1.6.1");

    this.isICAOWC = false;
    this.language = "en";
    this.openModalElmId = "";
    this.savedImageElmId = "";
    this.getImgSrc = (src) => console.log({ src });

    this.icaoRoot = this.attachShadow({ mode: "open" });
    icaoAppWC.shadowRoot = this.icaoRoot;
  }

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
        setIsCheckingICAOServiceThread,
        reestCashedArray,
        stopVideoStream,
        clearICAOServiceThread,
        utils,
        EnrolmentDevices,
      } = await import("./scripts/utils.js");
      const { StopWorker } = await import("./scripts/ICAOWorker.js");
      // const myUtils = (await import("./utils.js")).utils;
      // TODO: check this one belwo
      // setIsCheckingICAOServiceThread(false);
      StopWorker();
      reestCashedArray();
      console.log("calling stopvideo from openModalAndoadIcaoScripts()");
      stopVideoStream();
      clearICAOServiceThread(utils.CheckingICAOServiceThread);

      window.stream = null;

      removeScript("./scripts/script.js");
      removeScript("./scripts/utils.js");
      EnrolmentDevices.WebCam.Scripts.map((script) => {
        // removeScript(script);
        const scriptToRemove = this.icaoRoot.querySelector(
          `script[src="${script}"]`
        );

        if (scriptToRemove) {
          scriptToRemove.remove();
        }
      });
    });
  }

  disconnectedCallback() {
    console.log("disconnectedCallback()");
  }
}
