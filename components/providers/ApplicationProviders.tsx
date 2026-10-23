"use client";

import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function ApplicationProviders({
  children,
}: {
  children: ReactNode;
}) {
  const pathname = usePathname();
  // The component catalogue uses injected fixtures, without a user session or API calls.
  if (pathname === "/design-system" || pathname.startsWith("/preview/") || pathname.startsWith("/service")) return <>{children}</>;
  return (
    <AuthProvider>
      <NotificationProvider>{children}</NotificationProvider>
    </AuthProvider>
  );
}
