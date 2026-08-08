import { AppLayout } from "@/components/common/app-layout";
import { AddMaterialModal } from "@/components/inventory/AddMaterialModal";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <AppLayout>
      {children}
      <AddMaterialModal />
    </AppLayout>
  );
}
