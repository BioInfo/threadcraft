'use client';

import { useEffect, useState } from 'react';
import { Icons } from './Icons';

interface SuccessToastProps {
  show: boolean;
  message: string;
  onHide: () => void;
}

export const SuccessToast = ({ show, message, onHide }: SuccessToastProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (show) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onHide, 300); // Wait for animation to complete
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show && !isVisible) return null;

  return (
    <div className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
      isVisible ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
    }`}>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg flex items-center gap-3 min-w-[300px]">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <Icons.Check />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-green-800">{message}</p>
        </div>
        <button
          onClick={() => {
            setIsVisible(false);
            setTimeout(onHide, 300);
          }}
          className="flex-shrink-0 text-green-400 hover:text-green-600 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};