"use client";
import { LogoutModal } from "@/components/auth/LogoutModal";
import { useAuthSession } from "@/features/auth-session/useAuthSession";
import type { AuthContextType } from "@/types/authSession";
import React, { createContext, useContext } from "react";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const {
    user,
    login,
    logout,
    refreshUser,
    showLogoutModal,
    handleLogoutModalClose,
  } = useAuthSession();
  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
      <LogoutModal
        isVisible={showLogoutModal}
        onClose={handleLogoutModalClose}
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
