# \<get-icao-checker-wc>

This webcomponent follows the [open-wc](https://github.com/open-wc/open-wc) recommendation.

## Installation

```bash
npm i get-icao-checker-wc
```

## Usage

### React

1. If you use `TypeScript`, create `declarations.d.ts` in the root folder and add the following:

   ```typeScript
   declare namespace React.JSX {
    interface IntrinsicElements {
      "get-icao-checker-wc": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        isICAOWC?: boolean;
        openModalElmId?: string;
        savedImageElmId?: string;
        getImgSrc?: (src: string) => void;
        language?: string;
      };
    }
   }

    // Extend the HTMLElementTagNameMap to include the custom element
    interface HTMLElementTagNameMap {
      "get-icao-checker-wc": HTMLGetIcaoCheckerWcElement;
    }

    interface HTMLGetIcaoCheckerWcElement extends HTMLElement {
      isICAOWC: boolean;
      openModalElmId: string;
      savedImageElmId: string;
      getImgSrc: (src: string) => void;
      language?: string;
    }
   ```

2. Using the ICAO Web Component in your App component:

   ```jsx
   import "get-icao-checker-wc/get-icao-checker-wc.js";
   import { useEffect, useRef, useState } from "react";

   function App() {
     const [icaoImgSrc, setICAOImgSrc] = useState("");
     const icaoCheckerWCRef = useRef < HTMLGetIcaoCheckerWcElement > null;

     useEffect(() => {
       if (icaoCheckerWCRef.current) {
         icaoCheckerWCRef.current.getImgSrc = setICAOImgSrc;
       }
     }, [setICAOImgSrc]);

     return (
       <div className="container">
         <div className="icao-container container mt-4">
           <h2>React App - ICAO WC</h2>
           <div className="btns">
             <button
               className="btn btn-primary"
               id="open-icao-modal"
               name="icao-modal"
               type="button"
             >
               Open ICAO Modal
             </button>

             <button
               className="btn btn-success ms-4"
               name="icao-modal"
               type="button"
               onClick={() => console.log(icaoImgSrc)}
             >
               Log image Src
             </button>
           </div>

           <div className="result-image card">
             <img id="icao-result-image" src="" alt="" width="200px" />
           </div>
           <get-icao-checker-wc
             isICAOWC
             openModalElmId="open-icao-modal"
             savedImageElmId="icao-result-image"
             ref={icaoCheckerWCRef}
           ></get-icao-checker-wc>
         </div>
       </div>
     );
   }

   export default App;
   ```

### Angular

1. Generate your own component:

   ```bach
   ng generate component icao
   ```

2. Add the follwoing code in `icao.component.ts`:

   ```typeSCript
   import { Component } from '@angular/core';
   import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
   import 'get-icao-checker-wc/get-icao-checker-wc.js';

   @Component({
    selector: 'app-icao',
    standalone: true,
    imports: [],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './icao.component.html',
    styleUrl: './icao.component.css',
   })

   export class IcaoComponent {
    savedImgSrc = '';
    setSavedImgSrc = (src: string) => {
      console.log('Hello from angualr ICAO component');
      console.log(this.savedImgSrc);
      this.savedImgSrc = src;
    };
    handleLogImgBtn = () => {
      console.log(this.savedImgSrc);
    };
   }

   ```

3. Add the follwoing code in `icao.component.html`

   ```html
   <section class="icao-container">
     <h2>Angular App - ICAO WC</h2>

     <!-- button to open the modal -->
     <section class="btns">
       <button
         class="btn btn-primary"
         id="open-icao-modal"
         name="open-icao-modal"
         type="button"
       >
         Open ICAO Modal
       </button>

       <!-- button to log the captured image src  -->
       <button
         class="btn btn-success ms-4"
         id="open-icao-modal"
         name="open-icao-modal"
         type="button"
         (click)="handleLogImgBtn()"
       >
         Log image Src
       </button>
     </section>

     <!-- Placeholder to show the saved image from icao wc -->
     <div class="result-image card">
       <img id="icao-result-image" src="" alt="" width="200px" />
     </div>

     <!-- Using custom component -->
     <get-icao-checker-wc
       isICAOWC
       openModalElmId="open-icao-modal"
       savedImageElmId="icao-result-image"
       [getImgSrc]="this.setSavedImgSrc"
       language="en"
     ></get-icao-checker-wc>
   </section>
   ```

4. Using the `IcaoComponent` in your `app.component.ts`:

   ```typeScript
    import { Component } from '@angular/core';
    import { RouterOutlet } from '@angular/router';
    import { IcaoComponent } from './icao/icao.component';

    @Component({
      selector: 'app-root',
      standalone: true,
      imports: [RouterOutlet, IcaoComponent],
      template: ` <main class="container mt-4">
        <app-icao />
      </main>`,
      styleUrl: './app.component.css',
    })
    export class AppComponent {
      title = 'get-icao-angular';
    }

   ```

## Tooling configs

For most of the tools, the configuration is in the `package.json` to minimize the amount of files in your project.

If you customize the configuration a lot, you can consider moving them to individual files.

## Local Demo with `web-dev-server`

```bash
npm start
```

To run a local development server that serves the basic demo located in `demo/index.html`
