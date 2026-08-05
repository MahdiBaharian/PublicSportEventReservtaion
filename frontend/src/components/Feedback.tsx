import { useEffect, useState } from 'react';

interface FeedbackProps {
  type: 'inline' | 'toast' | 'modal' | 'popup' | 'confirm';
  status: 'error' | 'success' | 'warning';
  message: string;
  isOpen?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
}

export default function Feedback({ type, status, message, isOpen = true, onClose, onConfirm }: FeedbackProps) {
  const [visible, setVisible] = useState(isOpen);

  useEffect(() => {
    setVisible(isOpen);
    if (isOpen && (type === 'toast' || type === 'popup')) {
      const timer = setTimeout(() => {
        setVisible(false);
        if (onClose) onClose();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, type, onClose]);

  if (!visible || !message) return null;

  const styles = {
    error: {
      bg: 'bg-red-50',
      text: 'text-red-600',
      border: 'border-red-500',
      icon: (
        <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    success: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-500',
      icon: (
        <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-500',
      icon: (
        <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  const currentStyle = styles[status];

  if (type === 'inline') {
    return (
      <div className={`flex items-center gap-1 mt-1.5 text-xs font-bold ${currentStyle.text}`}>
        {currentStyle.icon}
        <span>{message}</span>
      </div>
    );
  }

  if (type === 'toast' || type === 'popup') {
    return (
      <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border-b-4 ${currentStyle.bg} ${currentStyle.border}`}>
        {currentStyle.icon}
        <span className={`text-sm font-bold ${currentStyle.text}`}>{message}</span>
        {onClose && (
          <button onClick={() => { setVisible(false); onClose(); }} className="mr-4 opacity-70 hover:opacity-100 transition">
            ✕
          </button>
        )}
      </div>
    );
  }

  if (type === 'modal') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
          <div className="flex justify-center mb-4 scale-150">
            {currentStyle.icon}
          </div>
          <h3 className={`text-lg font-bold mb-2 ${currentStyle.text}`}>{message}</h3>
          <button 
            onClick={() => { setVisible(false); if(onClose) onClose(); }}
            className={`mt-6 w-full py-2.5 rounded-lg text-white font-bold transition ${status === 'error' ? 'bg-red-600 hover:bg-red-700' : status === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-yellow-500 hover:bg-yellow-600'}`}
          >
            متوجه شدم
          </button>
        </div>
      </div>
    );
  }

  if (type === 'confirm') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6 text-center">
          <div className="flex justify-center mb-4 scale-150">
            {currentStyle.icon}
          </div>
          <h3 className={`text-lg font-bold mb-6 ${currentStyle.text}`}>{message}</h3>
          <div className="flex gap-3">
            <button 
              onClick={() => { setVisible(false); if(onConfirm) onConfirm(); }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 rounded-lg font-bold transition shadow-sm"
            >
              بله
            </button>
            <button 
              onClick={() => { setVisible(false); if(onClose) onClose(); }}
              className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2.5 rounded-lg font-bold transition shadow-sm"
            >
              انصراف
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}