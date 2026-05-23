let deferredPrompt;

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/goodnesshealthcare/service-worker.js");
  });
}

// Capture install prompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault();
  deferredPrompt = e;

  console.log("Install prompt ready");

  // Show install button manually
  const installBtn = document.createElement("button");
  installBtn.innerText = "Install App";
  installBtn.style.position = "fixed";
  installBtn.style.bottom = "20px";
  installBtn.style.right = "20px";
  installBtn.style.padding = "10px";
  installBtn.style.zIndex = "9999";

  document.body.appendChild(installBtn);

  installBtn.addEventListener("click", async () => {
    installBtn.remove();
    deferredPrompt.prompt();

    const choice = await deferredPrompt.userChoice;
    console.log(choice);

    deferredPrompt = null;
  });
});
