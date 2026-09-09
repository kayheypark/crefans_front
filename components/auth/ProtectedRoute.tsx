"use client";

import AuthGuard from "@/components/auth/AuthGuard";
import { ProtectedRouteProps } from "@/features/auth-protected-route/types";
import { useProtectedRouteModel } from "@/features/auth-protected-route/useProtectedRouteModel";

export default function ProtectedRoute(props: ProtectedRouteProps) {
  const model = useProtectedRouteModel(props);
  return <ProtectedRouteView {...props} model={model} />;
}

function ProtectedRouteView({
  children,
  fallback,
  model,
}: ProtectedRouteProps & { model: ReturnType<typeof useProtectedRouteModel> }) {
  const {} = model;

  return (
    <AuthGuard requireAuth={true} fallback={fallback}>
      {children}
    </AuthGuard>
  );
}
