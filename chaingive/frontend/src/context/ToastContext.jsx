import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => useContext(ToastContext);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const showToast = useCallback((message, type = 'success') => {
        const id = Date.now();
        setToasts((prev) => [...prev, { id, message, type }]);

        setTimeout(() => {
            removeToast(id);
        }, 5000);
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ showToast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col space-y-2 pointer-events-none">
                {toasts.map((toast) => (
                    <div
                        key={toast.id}
                        className={`pointer-events-auto px-5 py-4 bg-white rounded-xl shadow-lg border border-brand-border border-l-4 font-medium transform transition-all duration-300 translate-x-0 flex items-start gap-3 w-80 ${toast.type === 'success' ? 'border-l-emerald-500 text-brand-dark' :
                                toast.type === 'error' ? 'border-l-rose-500 text-brand-dark' :
                                    toast.type === 'pending' ? 'border-l-brand-secondary text-brand-dark' : 'border-l-gray-400 text-brand-dark'
                            }`}
                        style={{ animation: 'slideIn 0.3s ease-out' }}
                    >
                        <div className="shrink-0 mt-0.5">
                            {toast.type === 'pending' && (
                                <svg className="animate-spin h-5 w-5 text-brand-secondary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                            )}
                            {toast.type === 'success' && <span className="text-emerald-500 text-lg">✅</span>}
                            {toast.type === 'error' && <span className="text-rose-500 text-lg">❌</span>}
                        </div>
                        <span className="text-sm font-inter leading-tight">{toast.message}</span>
                    </div>
                ))}
            </div>
            <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
      `}</style>
        </ToastContext.Provider>
    );
};
