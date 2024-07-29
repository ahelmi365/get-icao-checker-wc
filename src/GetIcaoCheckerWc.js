import { html, css, LitElement } from "lit";
import { StopWorker } from "./scripts/ICAOWorker.js";
import { htmlTemplate } from "./scripts/htmlTemplate.js";
// #region Common JS

window.icaoAppWC = {};
icaoAppWC.isICAO = false;

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
  const clonedIcaoHTML = htmlTemplate.content.cloneNode(true);

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
  static properties = {
    isICAOWC: { type: Boolean },
    openModalElmId: { type: String },
    savedImageElmId: { type: String },
    getImgSrc: { type: Function },
  };

  constructor() {
    super();

    console.log("constructor version 1.3.5");

    this.isICAOWC = false;
    this.openModalElmId = "open-icao-modal";
    this.savedImageElmId = "cao-result-image";
    this.getImgSrc = (src) => console.log({ src });
    // this.attachShadow({ mode: "open" });
    this.icaoRoot = this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    // console.log(this.shadowRoot);
    // console.log(this.isICAOWC);
    // console.log(this.openModalElmId);
    // console.log(this.savedImageElmId);
    // console.log(this.getImgSrc);

    icaoAppWC.isICAO = this.isICAOWC;
    icaoAppWC.shadowRoot = this.shadowRoot;
    // console.log(icaoAppWC.isICAO);

    await initICAOModal(this.icaoRoot);
    try {
      const openModalBtn = document.getElementById(
        this.openModalBtnId ? this.openModalBtnId : "open-icao-modal"
      );

      if (!openModalBtn) {
        throw new Error(
          `No element found to open the ICAO Modal, please check the 'data-open-modal-button-id' attribute`
        );
      } else {
        openModalBtn.addEventListener(
          "click",
          this.openModalAndoadIcaoScripts.bind(this)
        );
      }
    } catch (error) {
      alert(error);
      console.error(
        `No element found to open the ICAO Modal, please check the 'data-open-modal-button-id' attribute`
      );
    }
    // handle saved image id

    try {
      this.savedImageElm = document.getElementById(
        this.savedImageId ? this.savedImageId : "icao-result-image"
      );
      if (!this.savedImageElm) {
        throw new Error(
          "No image element found to store the cropped image from ICAO Modal, please check the 'data-saved-image-id' attribute"
        );
      }
    } catch (error) {
      alert(error);
      console.error(
        "No image element found to store the cropped image from ICAO Modal, please check the 'data-saved-image-id' attribute"
      );
    }
  }

  async openModalAndoadIcaoScripts() {
    console.log("openModalAndoadIcaoScripts is called =======");
    this.shadowRoot
      .querySelector(".icao-modal-container")
      .classList.add("show");
    // this.openModal(this);
    const { onICAOScriptLoad } = await import("./scripts/script.js");
    onICAOScriptLoad(this.isICAOWC, this.savedImageElm, this.getImgSrc);

    window.addEventListener("hidden.bs.modal", async () => {
      const {
        setIsCheckingICAOServiceThread,
        reestCashedArray,
        stopVideoStream,
        ClearICAOServiceThread,
        utils,
        EnrolmentDevices,
      } = await import("./scripts/utils.js");
      // const myUtils = (await import("./utils.js")).utils;
      // TODO: check this one belwo
      // setIsCheckingICAOServiceThread(false);
      StopWorker();
      reestCashedArray();
      stopVideoStream();
      ClearICAOServiceThread(utils.CheckingICAOServiceThread);

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

  static styles = css`
    :host {
      display: block;
      padding: 25px;
      color: var(--get-icao-checker-wc-text-color, #000);
    }
  `;
}
