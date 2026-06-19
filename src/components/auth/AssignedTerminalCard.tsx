import { Warehouse } from "lucide-react";

interface AssignedTerminalCardProps {
  location?: string;
}

export function AssignedTerminalCard({
  location = "Sector 63, Noida (UP-04)",
}: AssignedTerminalCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#FF6B00]/20 bg-[#FFF4EC] px-4 py-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-[#FF6B00]">
        <Warehouse className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[#FF6B00]">
          Assigned Terminal
        </p>
        <p className="truncate text-sm font-semibold text-gray-900">
          {location}
        </p>
      </div>
    </div>
  );
}
