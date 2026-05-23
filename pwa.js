if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/goodnesshealthcare/service-worker.js", {
    scope: "/goodnesshealthcare/"
  })
    .then(reg => console.log("SW Registered:", reg.scope))
    .catch(err => console.log("SW failed:", err));
}
