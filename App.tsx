import React, { useState, useEffect } from 'react';
import { Scale, Sparkles, HelpCircle, History, ExternalLink, Github, BookOpen, Moon, Sun } from 'lucide-react';
import { 
  AudienceType, 
  FileData, 
  FormatType, 
  InputMode, 
  InterpretationConfig, 
  LengthType, 
  ToneType,
  HistoryItem 
} from './types';
import InputPanel from './components/InputPanel';
import SettingsPanel from './components/SettingsPanel';
import ResultDisplay from './components/ResultDisplay';
import HistoryDrawer from './components/HistoryDrawer';
import { interpretLaw } from './services/geminiService';

function App() {
  const [inputMode, setInputMode] = useState<InputMode>(InputMode.TEXT);
  const [textInput, setTextInput] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [fileData, setFileData] = useState<FileData | null>(null);
  const [userQuestion, setUserQuestion] = useState('');
  
  const [config, setConfig] = useState<InterpretationConfig>({
    tone: ToneType.NEUTRAL,
    audience: AudienceType.LAYMAN,
    format: FormatType.PARAGRAPHS,
    length: LengthType.MODERATE
  });

  const [result, setResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Load history & theme from local storage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('jurisHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error("Failed to parse history", e);
      }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setTheme('dark');
      document.documentElement.classList.add('dark');
    } else {
      setTheme('light');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Save history helper
  const saveToHistory = (text: string, question?: string, inputType?: string) => {
    const newItem: HistoryItem = {
      id: Date.now().toString(),
      date: new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      preview: question ? `Pergunta: ${question}` : `Análise de ${inputType || 'Documento'}`,
      userQuestion: question,
      result: text
    };
    
    const updatedHistory = [newItem, ...history].slice(0, 20); // Keep last 20
    setHistory(updatedHistory);
    localStorage.setItem('jurisHistory', JSON.stringify(updatedHistory));
  };

  const handleInterpret = async () => {
    // Validation
    if (inputMode === InputMode.TEXT && !textInput.trim()) return alert("Por favor, insira o texto.");
    if (inputMode === InputMode.URL && !urlInput.trim()) return alert("Por favor, insira a URL.");
    if (inputMode === InputMode.FILE && !fileData) return alert("Por favor, selecione um arquivo.");

    setLoading(true);
    setResult(null);

    let content: string | FileData = '';
    let previewType = '';

    if (inputMode === InputMode.TEXT) { content = textInput; previewType = 'Texto Manual'; }
    if (inputMode === InputMode.URL) { content = urlInput; previewType = 'URL Externa'; }
    if (inputMode === InputMode.FILE && fileData) { content = fileData; previewType = `Arquivo: ${fileData.name}`; }

    // Pass the userQuestion to the service
    const interpretation = await interpretLaw(inputMode, content, config, userQuestion);
    
    setResult(interpretation);
    setLoading(false);

    if (interpretation && !interpretation.includes("Ocorreu um erro")) {
      saveToHistory(interpretation, userQuestion, previewType);
    }
  };

  const isReady = () => {
    if (inputMode === InputMode.TEXT) return textInput.length > 10;
    if (inputMode === InputMode.URL) return urlInput.length > 5;
    if (inputMode === InputMode.FILE) return !!fileData;
    return false;
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans flex flex-col transition-colors duration-300">
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
        history={history}
        onSelect={(item) => {
          setResult(item.result);
          if (item.userQuestion) setUserQuestion(item.userQuestion);
        }}
        onClear={() => {
          setHistory([]);
          localStorage.removeItem('jurisHistory');
        }}
      />

      {/* Header - Professional Brazilian Aesthetic */}
      {/* Deep Navy Blue Base with Emerald Green Accent */}
      <header className="bg-blue-950 dark:bg-slate-950 border-b-[3px] border-emerald-600 sticky top-0 z-50 shadow-xl transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Logo Icon */}
            <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-blue-950 dark:text-blue-400 shadow-md border border-slate-200 dark:border-slate-700">
              <Scale size={28} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide font-serif leading-none">JusPátria</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-0.5 w-4 bg-yellow-400 rounded-full"></span>
                <p className="text-[10px] text-blue-200 dark:text-slate-400 font-medium uppercase tracking-[0.2em]">Inteligência Jurídica</p>
              </div>
            </div>
          </div>
          <nav className="flex gap-3">
             <button
              onClick={toggleTheme}
              className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-blue-100 hover:text-white transition-colors border border-white/5 hover:border-white/20"
              title="Alternar Tema"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button 
              onClick={() => setIsHistoryOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold text-white bg-emerald-700/80 hover:bg-emerald-600 px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-emerald-900/20 border border-emerald-600/50"
            >
              <History size={18} className="text-yellow-300" />
              <span className="hidden md:inline">Histórico</span>
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow">
        
        {/* Intro Section */}
        <div className="mb-12 text-center sm:text-left flex flex-col sm:flex-row items-end justify-between gap-6 border-b border-slate-200 dark:border-slate-800 pb-8">
          <div className="space-y-2">
             <h2 className="text-4xl font-bold text-blue-950 dark:text-blue-100 font-serif tracking-tight">Simplifique o Complexo.</h2>
             <p className="text-slate-600 dark:text-slate-400 max-w-2xl text-lg leading-relaxed font-light">
               Interpretação da legislação brasileira com rigor técnico, citações precisas e <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">Jurisprudência do STF e STJ</strong>.
             </p>
          </div>
          <div className="hidden sm:block text-right">
             <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-medium justify-end mb-2">
               <BookOpen size={16} className="text-blue-600 dark:text-blue-400" /> 
               Base Legal Atualizada
             </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Column: Input, Question & Settings */}
          <div className="lg:col-span-5 space-y-8">
            
            <InputPanel 
              inputMode={inputMode}
              setInputMode={setInputMode}
              textInput={textInput}
              setTextInput={setTextInput}
              urlInput={urlInput}
              setUrlInput={setUrlInput}
              fileData={fileData}
              setFileData={setFileData}
            />

            {/* Question Panel */}
            <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/30 border border-slate-100 dark:border-slate-800 p-6 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-blue-900 dark:bg-blue-600"></div>
              <div className="flex items-start gap-3 mb-4">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-900 dark:text-blue-300">
                  <HelpCircle size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg font-serif">Dúvida Específica</h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider font-bold mt-0.5">Opcional</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 leading-relaxed">
                Deseja focar a análise em um ponto específico ou verificar o entendimento do Supremo sobre um detalhe?
              </p>
              <textarea 
                value={userQuestion}
                onChange={(e) => setUserQuestion(e.target.value)}
                placeholder="Ex: O que o STF decidiu sobre a cobrança de IPTU em áreas rurais urbanizadas?"
                className="w-full p-4 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-700 dark:focus:border-blue-500 bg-slate-50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-900 text-slate-800 dark:text-slate-200 placeholder-slate-400 text-sm min-h-[100px] resize-none transition-all font-sans"
              />
            </div>
            
            <SettingsPanel config={config} setConfig={setConfig} />

            <button
              onClick={handleInterpret}
              disabled={!isReady() || loading}
              className={`w-full py-4 rounded-xl flex items-center justify-center gap-3 font-bold text-lg shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0 border group relative overflow-hidden ${
                !isReady() || loading
                  ? 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 dark:text-slate-600 cursor-not-allowed shadow-none'
                  : 'bg-emerald-700 dark:bg-emerald-600 border-emerald-800 dark:border-emerald-500 text-white hover:bg-emerald-800 dark:hover:bg-emerald-500 shadow-emerald-900/20'
              }`}
            >
              {/* Button Shine Effect */}
              {isReady() && !loading && (
                 <div className="absolute top-0 -left-full w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shimmer"></div>
              )}

              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Processando...</span>
                </div>
              ) : (
                <>
                  <Sparkles size={22} className="text-yellow-300 group-hover:scale-110 transition-transform" />
                  <span className="font-serif tracking-wide">Gerar Interpretação</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Output */}
          <div className="lg:col-span-7 h-full">
             <ResultDisplay 
               result={result} 
               loading={loading} 
               onReset={() => {
                 setResult(null);
                 setUserQuestion('');
               }} 
             />
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-blue-950 dark:bg-slate-950 text-slate-300 py-12 border-t border-slate-800 dark:border-slate-800 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-emerald-600 rounded flex items-center justify-center text-white">
                  <Scale size={18} />
                </div>
                <span className="text-xl font-bold text-white font-serif">JusPátria</span>
              </div>
              <p className="text-sm leading-loose text-slate-400 max-w-sm mb-6 font-light">
                Plataforma de inteligência jurídica dedicada a democratizar o acesso à informação legal. Utilizamos IA para cruzar textos normativos com a jurisprudência consolidada.
              </p>
              <div className="flex gap-2">
                 <div className="h-1 w-8 bg-blue-600 rounded-full"></div>
                 <div className="h-1 w-8 bg-yellow-500 rounded-full"></div>
                 <div className="h-1 w-8 bg-emerald-600 rounded-full"></div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs font-sans opacity-70">Fontes Oficiais</h4>
              <ul className="space-y-3 text-sm font-sans">
                <li>
                  <a href="https://www.planalto.gov.br/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
                    <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
                    Planalto - Legislação
                  </a>
                </li>
                <li>
                  <a href="https://portal.stf.jus.br/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
                     <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
                    STF - Jurisprudência
                  </a>
                </li>
                <li>
                  <a href="https://www.stj.jus.br/" target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-emerald-400 transition-colors group">
                     <ExternalLink size={14} className="opacity-50 group-hover:opacity-100" />
                    STJ - Superior Tribunal
                  </a>
                </li>
              </ul>
            </div>

            {/* Credits */}
            <div>
              <h4 className="text-white font-bold mb-6 uppercase tracking-wider text-xs font-sans opacity-70">Créditos</h4>
              <div className="p-4 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Desenvolvido por</p>
                <p className="text-white font-bold text-base font-serif">Alexandre Beltrame</p>
                
                <div className="flex items-center gap-3 pt-3 mt-3 border-t border-white/5">
                   <a href="#" className="text-slate-400 hover:text-white transition-colors">
                     <Github size={16} />
                   </a>
                   <span className="text-[10px] text-slate-500">© {new Date().getFullYear()} JusPátria.</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;