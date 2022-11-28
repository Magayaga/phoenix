import{Workbox}from"https://storage.googleapis.com/workbox-cdn/releases/4.0.0/workbox-window.prod.mjs";function getRoute(){const pathName=window.location.pathname,basePath=pathName.substring(0,pathName.lastIndexOf("/"));return`${basePath}/phoenix/vfs`}function serverReady(){console.log(`Server ready! Serving files on url: ${window.location.origin+getRoute()}`)}function serverInstall(){console.log("Web server Worker installed.")}if(window.fsServerUrl=window.location.origin+getRoute(),"serviceWorker"in navigator){console.log(window.location.href);const wb=new Workbox(`virtual-server-main.js?debug=${"true"===window.logToConsolePref}&route=${getRoute()}`);wb.controlling.then(serverReady),wb.addEventListener("installed",event=>{event.isUpdate||serverInstall()}),wb.register()}
//# sourceMappingURL=virtual-server-loader.js.map
