let deferredPrompt = null;


// ============================================================
// PWA SERVICE WORKER
// ============================================================

if ("serviceWorker" in navigator) {

  window.addEventListener("load", async () => {

    try {

      const registration =
        await navigator.serviceWorker.register(
          "/goodnesshealthcare/service-worker.js",
          {
            scope: "/goodnesshealthcare/"
          }
        );

      console.log(
        "✅ PWA Service Worker registered:",
        registration.scope
      );


      // Check for updated worker
      await registration.update();


    } catch (error) {

      console.error(
        "❌ PWA Service Worker registration failed:",
        error
      );

    }

  });

}


// ============================================================
// PWA RESUME / BACKGROUND RECOVERY
// ============================================================

let lastVisibleTime = Date.now();

document.addEventListener(
  "visibilitychange",
  async () => {

    if (
      document.visibilityState === "hidden"
    ) {

      lastVisibleTime = Date.now();

      console.log(
        "⏸️ App moved to background."
      );

      return;
    }


    if (
      document.visibilityState === "visible"
    ) {

      const hiddenFor =
        Date.now() - lastVisibleTime;

      console.log(
        "▶️ App resumed.",
        "Background duration:",
        Math.round(hiddenFor / 1000),
        "seconds"
      );


      // --------------------------------------------------------
      // Update PWA service worker
      // --------------------------------------------------------

      if ("serviceWorker" in navigator) {

        try {

          const registrations =
            await navigator.serviceWorker.getRegistrations();

          for (
            const registration
            of registrations
          ) {

            try {
              await registration.update();
            } catch (error) {
              console.warn(
                "⚠️ Service Worker update failed:",
                error
              );
            }

          }

        } catch (error) {

          console.warn(
            "⚠️ Could not check Service Worker:",
            error
          );

        }

      }


      // --------------------------------------------------------
      // Tell Dashboard / application that PWA resumed
      // --------------------------------------------------------

      window.dispatchEvent(
        new CustomEvent(
          "goodness-pwa-resumed",
          {
            detail: {
              hiddenFor
            }
          }
        )
      );

    }

  }
);


// ============================================================
// ALSO HANDLE PAGE SHOW
// ============================================================

window.addEventListener(
  "pageshow",
  event => {

    console.log(
      "📱 PWA pageshow event."
    );

    window.dispatchEvent(
      new CustomEvent(
        "goodness-pwa-pageshow",
        {
          detail: {
            persisted: event.persisted
          }
        }
      )
    );

  }
);


// ============================================================
// INSTALL PROMPT
// ============================================================

window.addEventListener(
  "beforeinstallprompt",
  event => {

    event.preventDefault();

    deferredPrompt = event;

    console.log(
      "✅ PWA install prompt ready."
    );

    createInstallButton();

  }
);


// ============================================================
// INSTALL BUTTON
// ============================================================

function createInstallButton() {

  if (
    document.getElementById(
      "pwa-install-button"
    )
  ) {
    return;
  }


  const installBtn =
    document.createElement("button");

  installBtn.id =
    "pwa-install-button";

  installBtn.innerText =
    "Install App";

  installBtn.style.position =
    "fixed";

  installBtn.style.bottom =
    "20px";

  installBtn.style.right =
    "20px";

  installBtn.style.padding =
    "10px 16px";

  installBtn.style.zIndex =
    "99999";


  document.body.appendChild(
    installBtn
  );


  installBtn.addEventListener(
    "click",
    async () => {

      if (!deferredPrompt) {
        return;
      }


      deferredPrompt.prompt();


      const choice =
        await deferredPrompt.userChoice;


      console.log(
        "PWA installation result:",
        choice
      );


      deferredPrompt = null;

      installBtn.remove();

    }
  );

}
