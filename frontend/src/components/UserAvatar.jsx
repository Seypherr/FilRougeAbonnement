import { useEffect, useState } from "react";

export function getUserInitials(name = "", email = "") {
  const source = name.trim() || email.trim() || "User";
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export function UserAvatar({ user, className = "size-10", textClassName = "text-sm", alt = "Profile avatar" }) {
  const [imageFailed, setImageFailed] = useState(false);
  const avatarUrl = user?.avatarUrl;
  const initials = getUserInitials(user?.name, user?.email);
  const showImage = avatarUrl && !imageFailed;

  useEffect(() => {
    setImageFailed(false);
  }, [avatarUrl]);

  return (
    <div className={`grid shrink-0 place-items-center overflow-hidden rounded-full bg-[#F4F0FF] font-black text-[#7047EB] ${className}`}>
      {showImage ? (
        <img
          src={avatarUrl}
          alt={alt}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <span className={textClassName} aria-label={`${initials} avatar fallback`}>
          {initials}
        </span>
      )}
    </div>
  );
}
