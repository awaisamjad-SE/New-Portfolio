import { useEffect } from "react";

export default function useTracking() {
  useEffect(() => {
    console.log("Tracking initialized...");

    const WEB_ID = "awaisamjad.me";
    const startTime = Date.now();
    let clickCount = 0;

    // Generate or retrieve device ID
    function getDeviceId() {
      let id = localStorage.getItem("analytics_device_id");
      if (!id) {
        id = "device-" + Math.random().toString(36).substr(2, 10);
        localStorage.setItem("analytics_device_id", id);
      }
      return id;
    }

    const deviceId = getDeviceId();

    // Count user clicks
    const handleClick = () => {
      clickCount++;
    };

    // When user leaves the page
    const handleBeforeUnload = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);

      const payload = {
        web_id: WEB_ID,
        device_id: deviceId,
        pageUrl: window.location.href,
        referrer: document.referrer,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
        language: navigator.language,
        browser: navigator.userAgent,
        utmParams: {},
        timeOnPage: timeSpent,
        clicks: clickCount,
      };

      console.log("Sending tracking data...", payload);

      fetch("https://octopus-app-qevgj.ondigitalocean.app/api/track/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true, // important during unload
      })
        .then((res) => res.json())
        .then((data) => console.log("Tracking saved:", data))
        .catch((err) => console.error("Tracking failed:", err));
    };

    // Attach event listeners
    document.addEventListener("click", handleClick);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Cleanup on unmount
    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
}
