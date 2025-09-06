"use client";

import Settings from "@/components/settings/Settings";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function SettingPage() {
  return (
    <ProtectedRoute>
      <Settings />
    </ProtectedRoute>
  );
}
