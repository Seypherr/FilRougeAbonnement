import { useEffect, useMemo, useState } from "react";
import { getSubscriptionInitial, getSubscriptionLogo } from "../utils/subscriptionLogos.js";

export function SubscriptionLogo({ name, className = "size-12 rounded-full", muted = false, rank = null }) {
  const logo = useMemo(() => getSubscriptionLogo(name), [name]);
  const [source, setSource] = useState("logo");
  const showImage = logo && source !== "fallback";
  const initial = getSubscriptionInitial(name);
  const imageSrc = source === "favicon" ? logo?.fallbackUrl : logo?.url;

  useEffect(() => {
    setSource("logo");
  }, [logo?.domain]);

  const handleImageError = () => {
    setSource((current) => (current === "logo" ? "favicon" : "fallback"));
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
        <span className="text-sm font-black text-[#6C51FF]" aria-label={`${name} fallback logo`}>
          {initial}
        </span>
      )}
      {rank !== null && (
        <span className="absolute -bottom-0.5 -right-0.5 grid size-5 place-items-center rounded-full border-2 border-white bg-[#6C51FF] text-[10px] font-black text-white">
          {rank}
        </span>
      )}
    </div>
  );
}
