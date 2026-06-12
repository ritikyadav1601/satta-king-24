"use client";

import { useEffect, useState } from "react";

function formatClock(date) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    month: "long",
    day: "numeric",
    year: "numeric"
  }).format(date);
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  }).format(date);
  return `${formattedDate} ${formattedTime}`;
}

export default function Clock({ className = "text-xl sm:text-2xl font-semibold text-pink-600 mb-4 uppercase text-center" }) {
  const [value, setValue] = useState("");

  useEffect(() => {
    function update() {
      setValue(formatClock(new Date()));
    }
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return <div className={className}>{value}</div>;
}
