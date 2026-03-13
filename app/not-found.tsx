import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";

export default function NotFound() {
  return (
    <PageLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
        <p className="text-6xl font-bold text-slate-300 mb-2">404</p>
        <p className="text-slate-600 mb-6">Page not found</p>
        <Link
          href="/home"
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700 underline underline-offset-2"
        >
          Back to Home
        </Link>
      </div>
    </PageLayout>
  );
}
