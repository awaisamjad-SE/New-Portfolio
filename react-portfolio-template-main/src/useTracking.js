import { useEffect } from "react";

const useTracking = () => {
    useEffect(() => {
        let startTime = Date.now();
        let clickCount = 0;

        // Capture initial user data
        let userData = {
            browser: navigator.userAgent,
            language: navigator.language,
            deviceType: /Mobi|Android/i.test(navigator.userAgent) ? "Mobile" : "Desktop",
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            referrer: document.referrer || "Direct",
        };

        // Track user clicks
        const handleClick = () => clickCount++;
        document.addEventListener("click", handleClick);

        // Fetch IP and location data (alternative API added)
        fetch("https://ipapi.co/json/")
            .then(response => response.json())
            .then(data => {
                userData = { ...userData, ...data };
            })
            .catch(error => console.error("Location fetch error:", error));

        // Send data when the user leaves
        const sendData = () => {
            let endTime = Date.now();
            userData.timeSpent = Math.floor((endTime - startTime) / 1000);
            userData.clicks = clickCount;

            fetch("http://127.0.0.1:8000/api/track-visit/", {  // ✅ Corrected endpoint
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(userData),
            })
                .then(response => response.json())
                .then(data => console.log("Tracking data sent successfully:", data))
                .catch(error => console.error("Data send error:", error));
        };

        window.addEventListener("beforeunload", sendData);

        return () => {
            document.removeEventListener("click", handleClick);
            window.removeEventListener("beforeunload", sendData);
        };
    }, []);
};

export default useTracking;
