import { useEffect } from "react";

export default function useTracking() {
  useEffect(() => {
    const WEB_ID = "softsincs.com";
    const startTime = Date.now();
    let clickCount = 0;

    function getDeviceId() {
      let id = localStorage.getItem("analytics_device_id");
      if (!id) {
        id = "device-" + Math.random().toString(36).substr(2, 10);
        localStorage.setItem("analytics_device_id", id);
      }
      return id;
    }

    function handleClick() {
      clickCount++;
    }

    function handleBeforeUnload() {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const payload = {
        web_id: WEB_ID,
        device_id: getDeviceId(),
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

      fetch("https://octopus-app-qevgj.ondigitalocean.app/api/track/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }

    document.addEventListener("click", handleClick);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("click", handleClick);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);
}
