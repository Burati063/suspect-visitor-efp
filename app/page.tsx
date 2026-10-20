import { redirect } from "next/navigation";

// Root → redirect to visitor page by default.
// Admin accesses /admin directly.
export default function RootPage() {
  redirect("/visitor");
}
