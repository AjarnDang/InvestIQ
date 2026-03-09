import { AuthGuard } from "@/components/providers/AuthGuard";
import { MainLayout } from "@/components/layout/MainLayout";
import { MarketProvider } from "@/components/providers/MarketProvider";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <MarketProvider>
        <MainLayout>{children}</MainLayout>
      </MarketProvider>
    </AuthGuard>
  );
}
