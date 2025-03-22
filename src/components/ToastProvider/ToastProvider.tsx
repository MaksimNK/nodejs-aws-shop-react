import React, { useEffect } from "react";

const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  useEffect(() => {
    const handleToast = (event: CustomEvent) => {
      const { message, severity } = event.detail;

      alert(`[${severity.toUpperCase()}] ${message}`);
    };

    window.addEventListener("global-toast", handleToast as EventListener);

    return () => {
      window.removeEventListener("global-toast", handleToast as EventListener);
    };
  }, []);

  return <>{children}</>;
};

export default ToastProvider;
