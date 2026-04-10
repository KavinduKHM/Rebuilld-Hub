import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";

const AlertContext = createContext(null);

const buildId = () => `alert-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const AlertProvider = ({ children }) => {
  const [alerts, setAlerts] = useState([]);
  const timersRef = useRef(new Map());

  const removeAlert = useCallback((id) => {
    setAlerts((prev) => prev.filter((item) => item.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
  }, []);

  const showAlert = useCallback(
    (message, options = {}) => {
      const id = options.id || buildId();
      const alert = {
        id,
        message,
        variant: options.variant || "info",
        duration: Object.prototype.hasOwnProperty.call(options, "duration")
          ? options.duration
          : 3200,
        actions: options.actions || [],
      };

      setAlerts((prev) => [...prev, alert]);

      if (alert.duration !== null && alert.duration !== undefined) {
        const timer = setTimeout(() => removeAlert(id), alert.duration);
        timersRef.current.set(id, timer);
      }

      return id;
    },
    [removeAlert]
  );

  const showConfirm = useCallback(
    (message, options = {}) =>
      new Promise((resolve) => {
        const id = options.id || buildId();
        const confirmLabel = options.confirmLabel || "Confirm";
        const cancelLabel = options.cancelLabel || "Cancel";

        const handleConfirm = () => {
          removeAlert(id);
          resolve(true);
        };

        const handleCancel = () => {
          removeAlert(id);
          resolve(false);
        };

        setAlerts((prev) => [
          ...prev,
          {
            id,
            message,
            variant: options.variant || "warning",
            duration: null,
            actions: [
              { label: confirmLabel, onClick: handleConfirm, tone: "primary" },
              { label: cancelLabel, onClick: handleCancel, tone: "ghost" },
            ],
          },
        ]);
      }),
    [removeAlert]
  );

  const value = useMemo(
    () => ({
      showAlert,
      showConfirm,
      removeAlert,
    }),
    [showAlert, showConfirm, removeAlert]
  );

  return (
    <AlertContext.Provider value={value}>
      {children}
      <div className="alert-stack" role="region" aria-live="polite" aria-label="Notifications">
        {alerts.map((alert) => (
          <div key={alert.id} className={`alert alert-toast alert--${alert.variant}`}>
            <div className="alert-toast__content">
              <span>{alert.message}</span>
              {alert.actions.length > 0 ? (
                <div className="alert-toast__actions">
                  {alert.actions.map((action, index) => (
                    <button
                      key={`${alert.id}-action-${index}`}
                      type="button"
                      className={`alert-toast__button${action.tone ? ` alert-toast__button--${action.tone}` : ""}`}
                      onClick={action.onClick}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            <button
              type="button"
              className="alert-toast__close"
              onClick={() => removeAlert(alert.id)}
              aria-label="Dismiss notification"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }
  return context;
};
