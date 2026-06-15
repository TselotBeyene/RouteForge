"use client";

import { useState } from "react";
import { ConfirmActionModal } from "@/components/ConfirmActionModal";
import { APP_NAME, LOGOUT_FLAG } from "@/lib/brand";

export type LogoutConfirmModalProps = {
  open: boolean;
  displayName: string;
  onClose: () => void;
};

export function LogoutConfirmModal({
  open,
  displayName,
  onClose,
}: LogoutConfirmModalProps) {
  const [loading, setLoading] = useState(false);

  function confirmLogout() {
    if (loading) return;

    setLoading(true);
    sessionStorage.setItem(LOGOUT_FLAG, "1");
    // Server reads id_token from cookies before clearing them.
    window.location.assign("/api/auth/keycloak-logout");
  }

  return (
    <ConfirmActionModal
      open={open}
      eyebrow="Confirm logout"
      title={`Sign out of ${APP_NAME}?`}
      description="This will sign you out and require you to log in again."
      items={[{ label: "Current session", value: displayName }]}
      confirmLabel="Confirm logout"
      cancelLabel="Cancel"
      confirmTone="danger"
      loading={loading}
      onCancel={onClose}
      onConfirm={confirmLogout}
    />
  );
}
