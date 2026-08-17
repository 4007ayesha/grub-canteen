import { useEffect } from "react";
import "./Modal.css";

function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="ui-modal-overlay" onClick={handleOverlayClick}>
      <div className="ui-modal" role="dialog" aria-modal="true">
        <button
          type="button"
          className="ui-modal-close"
          onClick={onClose}
          aria-label="Close modal"
        >
          ×
        </button>

        <div className="ui-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
}

export default Modal;