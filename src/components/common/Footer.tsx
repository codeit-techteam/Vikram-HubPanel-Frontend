import Link from "next/link";
import { Headphones } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white px-4 py-4 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex flex-col items-center gap-2 text-center text-xs text-gray-500 sm:flex-row sm:text-left sm:text-sm">
          <span>© 2024 ProcureBuild Enterprise. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <Link
              href="#"
              className="transition-colors hover:text-[#FF6B00]"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="transition-colors hover:text-[#FF6B00]"
            >
              Terms of Service
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 sm:text-sm">
          <Headphones className="h-4 w-4 shrink-0 text-gray-400" />
          <span>
            Technical Support:{" "}
            <a
              href="tel:+911800BUILDOPS"
              className="font-semibold text-[#FF6B00] hover:underline"
            >
              +91 1800-BUILDOPS
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
