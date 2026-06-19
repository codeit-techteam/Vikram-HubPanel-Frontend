import { AppLayout } from "@/components/common/app-layout";

export default function HubManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AppLayout>{children}</AppLayout>;
}
