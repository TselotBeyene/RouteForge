import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/options";
import { LogoutPageClient } from "./LogoutPageClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LogoutPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login?loggedOut=1");
  }

  const displayName =
    session.user.name || session.user.email || "Signed in user";

  return <LogoutPageClient displayName={displayName} />;
}
