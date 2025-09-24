import { useEffect } from "react";

export function usePingOnMount(url: string) {
  useEffect(() => {
    if (!url) return;
    // Fire and forget; don't block UI
    fetch(url, { method: "GET", cache: "no-store" })
      .then(() => {
        // Optionally log success
        console.log("Pinged:", url);
      })
      .catch(() => {
        // Optionally log error
        console.warn("Ping failed:", url);
      });
  }, [url]);
}
