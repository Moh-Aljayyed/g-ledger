"use client";

import { useState, useEffect } from "react";

// Geo-based currency detection
// Egypt → EGP, Gulf → SAR, Rest → USD
const GULF_COUNTRIES = ["SA", "AE", "KW", "BH", "OM", "QA"];
const EGYPT = "EG";

interface PriceSet {
  free: string;
  basic: string;
  pro: string;
  enterprise: string;
  currency: string;
  perUser: string;
}

const PRICES: Record<string, PriceSet> = {
  EGP: { free: "0", basic: "400", pro: "750", enterprise: "1,250", currency: "ج.م", perUser: "/مستخدم/شهر" },
  SAR: { free: "0", basic: "40", pro: "75", enterprise: "125", currency: "ر.س", perUser: "/مستخدم/شهر" },
  USD: { free: "$0", basic: "$8", pro: "$15", enterprise: "$25", currency: "", perUser: "/user/mo" },
};

export function useGeoPricing() {
  const [currency, setCurrency] = useState<"EGP" | "SAR" | "USD">("USD");
  const [detected, setDetected] = useState(false);
  const [countryCode, setCountryCode] = useState("");

  useEffect(() => {
    // Check if already detected
    const saved = localStorage.getItem("gl_geo_currency");
    if (saved && ["EGP", "SAR", "USD"].includes(saved)) {
      setCurrency(saved as any);
      setDetected(true);
      return;
    }

    // Detect from IP
    fetch("https://ipapi.co/json/")
      .then(res => res.json())
      .then(data => {
        const cc = data.country_code;
        setCountryCode(cc);
        let cur: "EGP" | "SAR" | "USD" = "USD";
        if (cc === EGYPT) cur = "EGP";
        else if (GULF_COUNTRIES.includes(cc)) cur = "SAR";
        setCurrency(cur);
        localStorage.setItem("gl_geo_currency", cur);
        setDetected(true);
      })
      .catch(() => {
        setCurrency("USD");
        setDetected(true);
      });
  }, []);

  const prices = PRICES[currency];

  return { currency, prices, detected, countryCode, setCurrency };
}

// Pricing display component that auto-detects geo
export function GeoPriceTag({ tier }: { tier: "free" | "basic" | "pro" | "enterprise" }) {
  const { prices } = useGeoPricing();

  if (tier === "free") return <>{prices.free}</>;

  return (
    <>
      {prices[tier]} {prices.currency}
      <span className="text-sm font-normal text-gray-400">{prices.perUser}</span>
    </>
  );
}
