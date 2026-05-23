if ("serviceWorker" in navigator) {
  window.addEventListener("load", async () => {
    try {
      const reg = await navigator.serviceWorker.register(
        "/goodnesshealthcare/service-worker.js"
      );

      console.log("SW registered", reg);

    } catch (err) {
      console.log("SW failed", err);
    }
  });
}
