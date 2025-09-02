import { useEffect } from "react";
import "./App.css";

export default function Snackbar({ open, message, type = "info", duration = 2000, onClose }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  return (
    <div className={`snackbar ${open ? "show" : ""} ${type}`}>
      {message}
    </div>
  );
}