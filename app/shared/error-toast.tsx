"use client";

import styles from "./error-toast.module.css";

export type ErrorToastState = {
  id: number;
  message: string;
};

type ErrorToastProps = {
  toast: ErrorToastState | null;
  onClear: (toastId: number) => void;
};

export default function ErrorToast({ toast, onClear }: ErrorToastProps) {
  if (!toast) {
    return null;
  }

  return (
    <div
      key={toast.id}
      className={styles.errorToast}
      role="alert"
      onAnimationEnd={() => {
        onClear(toast.id);
      }}
    >
      {toast.message}
    </div>
  );
}
