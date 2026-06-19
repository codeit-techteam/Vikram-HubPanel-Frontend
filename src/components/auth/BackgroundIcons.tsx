import {
  Box,
  Forklift,
  Package,
  Truck,
  Warehouse,
} from "lucide-react";

const BACKGROUND_ICONS = [
  { Icon: Warehouse, className: "left-[5%] top-[18%] h-24 w-24 rotate-[-8deg] sm:h-32 sm:w-32" },
  { Icon: Truck, className: "right-[8%] top-[12%] h-20 w-20 rotate-[6deg] sm:h-28 sm:w-28" },
  { Icon: Package, className: "left-[12%] bottom-[22%] h-16 w-16 rotate-[12deg] sm:h-24 sm:w-24" },
  { Icon: Box, className: "right-[15%] bottom-[30%] h-20 w-20 rotate-[-10deg] sm:h-28 sm:w-28" },
  { Icon: Forklift, className: "right-[4%] bottom-[15%] h-16 w-16 rotate-[4deg] sm:h-20 sm:w-20" },
] as const;

export function BackgroundIcons() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {BACKGROUND_ICONS.map(({ Icon, className }, index) => (
        <Icon
          key={index}
          className={`absolute text-gray-900 opacity-[0.05] ${className}`}
          strokeWidth={1}
        />
      ))}
    </div>
  );
}
