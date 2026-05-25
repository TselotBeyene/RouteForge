"use client";

import { useRouter } from "next/navigation";
import { LogoutConfirmModal } from "@/components/LogoutConfirmModal";

export function LogoutPageClient({ displayName }: { displayName: string }) {
  const router = useRouter();

  return (
    <LogoutConfirmModal
      open
      displayName={displayName}
      onClose={() => router.replace("/integrations")}
    />
  );
}
