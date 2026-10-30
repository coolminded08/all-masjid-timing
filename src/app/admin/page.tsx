import { redirect } from "next/navigation";
import { isAuthenticatedAdmin } from "@/lib/auth";

export default async function AdminRootPage() {
  const isAuthed = await isAuthenticatedAdmin();

  if (isAuthed) {
    redirect("/admin/dashboard");
  } else {
    redirect("/admin/login");
  }
}
