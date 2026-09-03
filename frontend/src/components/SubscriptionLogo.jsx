import { useEffect, useMemo, useState } from "react";
import { getSubscriptionLogo } from "../utils/subscriptionLogos.js";

function getPreferredSource(logo) {
  return logo?.url?.includes("img.logo.dev") && logo?.fallbackUrl ? "favicon" : "logo";
}

export function SubscriptionLogo({ name, className = "size-12 rounded-full", muted = false, logoOverride = null }) {
  const localLogo = useMemo(() => getSubscriptionLogo(name), [name]);
  const logo = logoOverride ?? localLogo;
  const [source, setSource] = useState(() => getPreferredSource(logo));
  const showImage = logo?.hasLogo && source !== "fallback";
  const initial = logo?.initials ?? "?";
  const imageSrc = source === "favicon" ? logo?.fallbackUrl : logo?.url;

  useEffect(() => {
    setSource(getPreferredSource(logo));
  }, [logo?.domain, logo?.fallbackUrl, logo?.url]);

  const handleImageError = () => {
    setSource((current) => (current === "logo" && logo?.fallbackUrl ? "favicon" : "fallback"));
  };

  return (
    <div className={`relative flex shrink-0 items-center justify-center overflow-hidden border border-slate-100 bg-white shadow-sm ${className} ${muted ? "opacity-60 grayscale" : ""}`}>
      {showImage ? (
        <img
          src={imageSrc}
          alt={`${logo.brand} logo`}
          className="size-full object-contain p-2"
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={handleImageError}
        />
      ) : (
        <span
          className="grid size-full place-items-center text-sm font-black"
          style={logo?.style}
          aria-label={`${name} fallback logo`}
        >
          {initial}
        </span>
      )}
    </div>
  );
}
