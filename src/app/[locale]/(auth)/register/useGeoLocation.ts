"use client";
import { useState, useEffect } from "react";

export function useGeoLocation() {
  const [country, setCountry] = useState<string>("SA");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        const countryMap: Record<string, string> = {
          SA: "SA", EG: "EG", AE: "AE", KW: "KW", BH: "BH",
          OM: "OM", QA: "QA", JO: "JO", IQ: "IQ", MA: "MA",
          TN: "TN", SD: "SD", LY: "LY", LB: "LB",
        };
        setCountry(countryMap[data.country_code] || "SA");
      })
      .catch(() => setCountry("SA"))
      .finally(() => setLoading(false));
  }, []);

  return { country, loading };
}
