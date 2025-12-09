import React from 'react';
import { X, Clock, FileText, ChevronRight, Trash2 } from 'lucide-react';
import { HistoryItem } from '../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onClear: () => void;
}

const HistoryDrawer: React.FC<HistoryDrawerProps> = ({ 
  isOpen, 
  onClose, 
  history, 
  onSelect,
  onClear
}) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[60] transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 shadow-2xl z-[70] transform transition-transform duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-green-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock size={20} className="text-yellow-400" />
            <h2 className="font-bold serif-font text-lg">Histórico</h2>
          </div>
          <button onClick={onClose} className="text-green-100 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-white dark:bg-slate-900 transition-colors">
          {history.length === 0 ? (
            <div className="text-center text-slate-400 dark:text-slate-600 mt-10">
              <Clock size={40} className="mx-auto mb-3 opacity-20" />
              <p className="text-sm">Nenhuma análise salva ainda.</p>
            </div>
          ) : (
            history.map((item) => (
              <div 
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group p-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-white dark:hover:bg-slate-700 hover:border-green-600 dark:hover:border-green-500 hover:shadow-md transition-all cursor-pointer relative"
              >
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] font-bold uppercase tracking-wider text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/40 px-2 py-0.5 rounded-full">
                     {item.date}
                   </span>
                </div>
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-1 line-clamp-2 serif-font">
                  {item.userQuestion || item.preview}
                </h4>
                <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-2 gap-1 group-hover:text-blue-700 dark:group-hover:text-blue-300">
                  <FileText size={12} />
                  <span>Ver análise completa</span>
                  <ChevronRight size={12} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))
          )}
        </div>

        {history.length > 0 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 transition-colors">
            <button 
              onClick={onClear}
              className="w-full py-2 px-4 flex items-center justify-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 rounded-lg text-sm font-medium transition-colors"
            >
              <Trash2 size={16} />
              Limpar Histórico
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default HistoryDrawer;