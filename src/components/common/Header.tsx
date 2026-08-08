function HubOpsLogo() {
  return (
    <svg
      width="36"
      height="36"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="36" height="36" rx="8" fill="#1E3A5F" />
      <path
        d="M10 26V10H14.5L18 16.5L21.5 10H26V26H22V17.5L18 24L14 17.5V26H10Z"
        fill="#FF6B00"
      />
      <path
        d="M10 10H14L18 16L22 10H26L20 18L26 26H22L18 20L14 26H10L16 18L10 10Z"
        fill="#3B82F6"
        opacity="0.9"
      />
    </svg>
  );
}

export function Header() {
  return (
    <header className="fixed top-0 z-50 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <HubOpsLogo />
        <div className="hidden h-6 w-px bg-gray-200 sm:block" />
        <div className="flex items-baseline gap-0.5">
          <span className="text-base font-bold text-[#FF6B00] sm:text-lg">
            HubOps
          </span>
          <span className="text-base font-semibold text-gray-900 sm:text-lg">
            Central
          </span>
        </div>
      </div>
    </header>
  );
}
