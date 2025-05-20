"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { message } from "antd";

interface NotificationContextType {
  showNotification: (
    type: "success" | "error" | "info" | "warning",
    content: string
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const showNotification = useCallback(
    (type: "success" | "error" | "info" | "warning", content: string) => {
      message[type](content);
    },
    []
  );

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
