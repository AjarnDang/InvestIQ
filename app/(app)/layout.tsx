import React from "react";
import { AuthGuard } from "@/components/providers/AuthGuard";
import { PageLayout } from "@/components/layout/PageLayout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <PageLayout>{children}</PageLayout>
    </AuthGuard>
  );
}
