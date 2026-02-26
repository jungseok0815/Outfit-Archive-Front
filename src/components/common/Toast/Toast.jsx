import React, { useEffect } from "react";
import "./Toast.css";

function Toast({ message, type = "success", onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  return (
    <div className={`toast toast--${type}`}>
      <span className="toast__icon">
        {type === "success" ? "✓" : "✕"}
      </span>
      <span className="toast__message">{message}</span>
      <button className="toast__close" onClick={onClose}>✕</button>
    </div>
  );
}

export default Toast;
