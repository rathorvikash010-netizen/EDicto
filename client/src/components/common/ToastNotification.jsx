import { useEffect, useState } from 'react';
import { FiCheck, FiInfo, FiAlertTriangle, FiX } from 'react-icons/fi';

const iconMap = {
  success: <FiCheck />,
  info: <FiInfo />,
  warning: <FiAlertTriangle />,
};

function Toast({ id, message, type = 'success', onClose }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(() => onClose(id), 300);
    }, 2500);
    return () => clearTimeout(timer);
  }, [id, onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(() => onClose(id), 300);
  };

  return (
    <div className={`toast toast-${type} ${exiting ? 'toast-exit' : 'toast-enter'}`}>
      <span className="toast-icon">{iconMap[type] || iconMap.success}</span>
      <span className="toast-message">{message}</span>
      <button className="toast-close" onClick={handleClose} aria-label="Close notification">
        <FiX size={14} />
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, removeToast }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          id={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={removeToast}
        />
      ))}
    </div>
  );
}
