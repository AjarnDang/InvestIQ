import React from "react";
import { PageLayout } from "@/components/layout/PageLayout";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PageLayout>{children}</PageLayout>;
}
