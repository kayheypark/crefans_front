"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export function useLandingModel() {
  const { user } = useAuth();
  const router = useRouter();
  const [dialog, setDialog] = useState<"signup" | "login" | null>(null);
  const [isEarlybird, setIsEarlybird] = useState(false);
  return {
    isEarlybird,
    startEarlybird: () => {
      setIsEarlybird(true);
      setDialog("signup");
    },
    signedIn: !!user,
    dialog,
    closeDialog: () => {
      setDialog(null);
      setIsEarlybird(false);
    },
    openLogin: () => setDialog("login"),
    start: () => {
      setIsEarlybird(false);
      if (user) router.push("/feed");
      else setDialog("signup");
    },
  };
}
