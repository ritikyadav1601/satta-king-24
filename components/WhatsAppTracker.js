"use client";

import { useEffect } from "react";

// Sends a GA4 "whatsapp_click" event for every wa.me link on the site.
// Add data-wa-pos="..." on a link to see which button was clicked.
export default function WhatsAppTracker() {
  useEffect(() => {
    function onClick(event) {
      const link = event.target.closest?.('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
      if (!link || typeof window.gtag !== "function") return;

      const number = (link.href.match(/wa\.me\/(\d+)/) || [])[1] || "";
      window.gtag("event", "whatsapp_click", {
        wa_position: link.dataset.waPos || "unknown",
        wa_number: number,
        link_url: link.href,
        page_path: window.location.pathname,
        transport_type: "beacon"
      });
    }

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
