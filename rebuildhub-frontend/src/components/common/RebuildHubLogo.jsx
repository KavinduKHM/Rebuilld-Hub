import React from "react";

export function RebuildHubLogo({ className = "brand-mark" }) {
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M16 2L28 8V20L16 30L4 20V8L16 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-outline"
      />

      <path
        d="M10 18L16 12L22 16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-link"
      />

      <circle cx="10" cy="18" r="2" fill="currentColor" className="logo-node" />
      <circle cx="16" cy="12" r="2" fill="currentColor" className="logo-node" />
      <circle cx="22" cy="16" r="2" fill="currentColor" className="logo-node" />

      <path
        d="M16 12V24"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="logo-link"
      />
      <circle cx="16" cy="24" r="2" fill="currentColor" className="logo-node" />
    </svg>
  );
}

export default RebuildHubLogo;