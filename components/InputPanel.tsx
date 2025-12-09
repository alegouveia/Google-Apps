import React, { useRef, useState, useEffect } from 'react';
import { FileText, Link as LinkIcon, Upload, X, AlertCircle, CheckCircle } from 'lucide-react';
import { InputMode, FileData } from '../types';

interface InputPanelProps {
  inputMode: InputMode;
  setInputMode: (mode: InputMode) => void;
  textInput: string;
  setTextInput: (text: string) => void;
  urlInput: string;
  setUrlInput: (url: string) => void;
  fileData: FileData | null;
  setFileData: (file: FileData | null) => void;
}

const InputPanel: React.FC<InputPanelProps> = ({
  inputMode,
  setInputMode,
  textInput,
  setTextInput,
  urlInput,
  setUrlInput,
  fileData,
  setFileData
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [urlIsValid, setUrlIsValid] = useState<boolean | null>(null);

  useEffect(() => {
    if (inputMode === InputMode.URL && urlInput) {
      validateUrl(urlInput);
    } else if (!urlInput) {
      setUrlIsValid(null);
    }
  }, [inputMode, urlInput]);

  const validateUrl = (value: string) => {
    if (!value) {
      setUrlIsValid(null);
      return;
    }
    try {
      new URL(value);
      setUrlIsValid(true);
    } catch {
      setUrlIsValid(false);
    }
  };

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setUrlInput(value);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64String = (e.target?.result as string).split(',')[1];
      setFileData({
        name: file.name,
        mimeType: file.type || 'text/plain', 
        data: base64String
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col h-auto min-h-[400px] transition-colors">
      {/* Header with Brazil Colors Accent */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 relative transition-colors">
        <div className="absolute top-0 left-0 w-1 h-full bg-emerald-600 dark:bg-emerald-600"></div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 font-serif">Documento Fonte</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-sans">Selecione o formato do conteúdo a ser analisado.</p>
      </div>

      {/* Tabs - Folder Style */}
      <div className="flex px-6 pt-4 gap-2 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 transition-colors">
        <button
          onClick={() => setInputMode(InputMode.TEXT)}
          className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold rounded-t-lg flex items-center gap-2 transition-all ${
            inputMode === InputMode.TEXT
              ? 'text-blue-900 dark:text-blue-400 bg-white dark:bg-slate-900 border-x border-t border-slate-200 dark:border-slate-800 shadow-sm translate-y-[1px] border-t-2 border-t-emerald-500'
              : 'text-slate-500 dark:text-slate-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
          }`}
        >
          <FileText size={16} className={inputMode === InputMode.TEXT ? "text-yellow-500" : ""} />
          Texto
        </button>
        <button
          onClick={() => setInputMode(InputMode.FILE)}
          className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold rounded-t-lg flex items-center gap-2 transition-all ${
            inputMode === InputMode.FILE
              ? 'text-blue-900 dark:text-blue-400 bg-white dark:bg-slate-900 border-x border-t border-slate-200 dark:border-slate-800 shadow-sm translate-y-[1px] border-t-2 border-t-emerald-500'
              : 'text-slate-500 dark:text-slate-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
          }`}
        >
          <Upload size={16} className={inputMode === InputMode.FILE ? "text-yellow-500" : ""} />
          Arquivo
        </button>
        <button
          onClick={() => setInputMode(InputMode.URL)}
          className={`px-4 py-2.5 text-xs uppercase tracking-wider font-bold rounded-t-lg flex items-center gap-2 transition-all ${
            inputMode === InputMode.URL
              ? 'text-blue-900 dark:text-blue-400 bg-white dark:bg-slate-900 border-x border-t border-slate-200 dark:border-slate-800 shadow-sm translate-y-[1px] border-t-2 border-t-emerald-500'
              : 'text-slate-500 dark:text-slate-500 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
          }`}
        >
          <LinkIcon size={16} className={inputMode === InputMode.URL ? "text-yellow-500" : ""} />
          URL
        </button>
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col bg-white dark:bg-slate-900 transition-colors">
        {inputMode === InputMode.TEXT && (
          <textarea
            className="w-full flex-1 p-5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 resize-none text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-slate-800 placeholder-slate-400 font-serif text-base leading-relaxed transition-all"
            placeholder="Cole o texto da lei, cláusulas contratuais ou documento jurídico aqui para análise..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />
        )}

        {inputMode === InputMode.FILE && (
          <div
            className={`flex-1 border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-8 transition-all duration-300 ${
              dragActive 
                ? 'border-yellow-500 bg-yellow-50/30 dark:bg-yellow-900/20' 
                : 'border-slate-200 dark:border-slate-700 bg-slate-50/30 dark:bg-slate-800/50 hover:border-emerald-300 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {fileData ? (
              <div className="flex flex-col items-center animate-fadeIn">
                <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-4 text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-100 dark:border-emerald-800">
                  <FileText size={32} />
                </div>
                <p className="text-slate-900 dark:text-slate-100 font-bold mb-1 text-center break-all font-serif">{fileData.name}</p>
                <p className="text-emerald-700 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-widest mb-6 bg-emerald-50 dark:bg-emerald-900/50 px-3 py-1 rounded-full">Documento Anexado</p>
                <button
                  onClick={() => setFileData(null)}
                  className="px-5 py-2.5 text-red-600 dark:text-red-400 text-sm font-medium hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-900/30 transition-colors flex items-center gap-2 shadow-sm"
                >
                  <X size={16} /> Remover Arquivo
                </button>
              </div>
            ) : (
              <>
                <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center mb-5 text-blue-900 dark:text-blue-400 shadow-sm border border-blue-100 dark:border-blue-800">
                  <Upload size={28} />
                </div>
                <p className="text-slate-800 dark:text-slate-200 font-bold text-lg mb-1 font-serif">Arraste seu documento</p>
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-8 font-sans">Suporta PDF, TXT ou Markdown</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept=".pdf,.txt,.md"
                  onChange={handleFileChange}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-8 py-3 bg-blue-950 dark:bg-blue-800 text-white rounded-lg hover:bg-blue-900 dark:hover:bg-blue-700 transition-all font-medium text-sm shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  Selecionar do Computador
                </button>
              </>
            )}
          </div>
        )}

        {inputMode === InputMode.URL && (
          <div className="flex flex-col h-full justify-center max-w-lg mx-auto w-full">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 font-serif">Link do Documento Público</label>
            <div className="relative mb-6 group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <LinkIcon size={20} className="text-slate-400 group-focus-within:text-emerald-600 transition-colors" />
              </div>
              <input
                type="url"
                className={`w-full pl-12 pr-12 py-4 border rounded-xl focus:ring-4 focus:outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 transition-all shadow-sm ${
                  urlIsValid === false
                    ? 'border-red-300 focus:ring-red-100 focus:border-red-400'
                    : urlIsValid === true
                    ? 'border-emerald-300 focus:ring-emerald-100 focus:border-emerald-500'
                    : 'border-slate-200 dark:border-slate-700 focus:ring-blue-100 focus:border-blue-900'
                }`}
                placeholder="https://planalto.gov.br/lei-exemplo"
                value={urlInput}
                onChange={handleUrlChange}
              />
              <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                {urlIsValid === true && <CheckCircle size={20} className="text-emerald-500" />}
                {urlIsValid === false && <AlertCircle size={20} className="text-red-500" />}
              </div>
            </div>
            
            {urlIsValid === false && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm flex items-center gap-2 mb-4 animate-fadeIn">
                 <AlertCircle size={16} />
                 <span>URL inválida. Comece com <strong>http://</strong> ou <strong>https://</strong>.</span>
              </div>
            )}
            
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900/30 rounded-lg p-4 shadow-sm">
               <p className="text-sm text-yellow-800 dark:text-yellow-200 flex gap-3 leading-relaxed">
                 <span className="text-xl">⚠️</span>
                 <span>A IA acessará o conteúdo público. Certifique-se de que o link não exija login, senha ou esteja em uma intranet.</span>
               </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InputPanel;