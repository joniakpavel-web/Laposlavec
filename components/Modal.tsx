
import React from 'react';
import { COLORS } from '../constants';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<Props> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-25"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-md h-[90vh] max-h-[800px] ${COLORS.card} border ${COLORS.goldBorder} rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 duration-300`}
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-4 border-b border-amber-900/50 flex-shrink-0">
          <h2 className="text-xl font-serif-fantasy text-amber-500">{title}</h2>
          <button 
            onClick={onClose} 
            className="text-stone-500 hover:text-amber-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </header>
        <div className="flex-1 overflow-y-auto p-4">
            {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
