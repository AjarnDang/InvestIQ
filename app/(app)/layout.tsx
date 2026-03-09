import { AuthGuard } from "@/components/providers/AuthGuard";
import { MainLayout } from "@/components/layout/MainLayout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MainLayout>{children}</MainLayout>
    </AuthGuard>
  );
}
