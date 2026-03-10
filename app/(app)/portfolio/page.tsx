// Portfolio has been merged into Dashboard.
// This redirect ensures any existing links to /portfolio still work.
import { redirect } from "next/navigation";

export default function PortfolioRedirect() {
  redirect("/dashboard");
}
