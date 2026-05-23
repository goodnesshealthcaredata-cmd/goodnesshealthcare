if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/goodnesshealthcare/service-worker.js")
    .then(() => console.log("Service Worker Registered"))
    .catch(err => console.log("SW failed:", err));
}
