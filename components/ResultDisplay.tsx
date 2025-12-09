import React, { useEffect, useRef, useState } from 'react';
import { Copy, Check, RotateCcw, FileSignature, Highlighter, Type, ChevronDown, Download, FileText, ChevronUp, BookOpen, Scale, Gavel, Sparkles, X, Lightbulb } from 'lucide-react';
import { generatePracticalExample } from '../services/geminiService';

interface ResultDisplayProps {
  result: string | null;
  loading: boolean;
  onReset: () => void;
}

interface AnalysisBlock {
  id: string;
  article: string;
  interpretation: string;
  jurisprudence: string;
  raw: string; // fallback
}

// Helper to convert basic Markdown to HTML safely
const formatMarkdown = (text: string): string => {
  if (!text) return '';
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
    .replace(/^> (.*$)/gm, '<blockquote class="border-l-4 border-yellow-400 pl-4 py-1 my-2 bg-yellow-50 dark:bg-yellow-900/10 text-slate-700 dark:text-slate-300 italic">$1</blockquote>') // Blockquote
    .replace(/\n/g, '<br />'); // Line breaks
  return html;
};

const AnalysisCard: React.FC<{ 
  block: AnalysisBlock; 
  fontClass: string;
  onAskExample: (context: string) => void;
}> = ({ block, fontClass, onAskExample }) => {
  const [showInterpretation, setShowInterpretation] = useState(true);
  const [showJurisprudence, setShowJurisprudence] = useState(false);

  // If parsing failed and we only have raw text, render it differently
  if (!block.article && !block.interpretation) {
    return (
      <div className={`mb-8 p-6 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm ${fontClass}`}>
        <div className="text-slate-800 dark:text-slate-200" dangerouslySetInnerHTML={{ __html: formatMarkdown(block.raw) }} />
      </div>
    );
  }

  return (
    <div className="mb-6 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header: Artigo (Always Visible) */}
      <div className="bg-slate-50 dark:bg-slate-900 p-5 border-b border-slate-100 dark:border-slate-700 flex items-start gap-4">
        <div className="mt-1 p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg shrink-0">
          <BookOpen size={20} />
        </div>
        <div className="flex-1">
           <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300 uppercase tracking-wider mb-2 font-sans">Artigo em Questão</h4>
           <div 
             className={`text-slate-900 dark:text-slate-100 font-medium leading-relaxed font-serif text-lg ${fontClass}`}
             dangerouslySetInnerHTML={{ __html: formatMarkdown(block.article) }}
           />
        </div>
      </div>

      {/* Body: Interpretation */}
      <div className="border-b border-slate-100 dark:border-slate-700">
        <button 
          onClick={() => setShowInterpretation(!showInterpretation)}
          className="w-full flex items-center justify-between p-3 px-5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-sm font-sans">
             <Scale size={16} />
             <span>Interpretação Simplificada</span>
          </div>
          {showInterpretation ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
        </button>
        
        {showInterpretation && (
          <div className="p-6 pt-2 bg-white dark:bg-slate-800 animate-fadeIn relative">
            <div 
              className={`text-slate-700 dark:text-slate-300 leading-loose text-justify ${fontClass}`}
              dangerouslySetInnerHTML={{ __html: formatMarkdown(block.interpretation) }}
            />
            
            {/* Practical Example Link */}
            <div className="mt-4 flex justify-end">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  onAskExample(`${block.article}\n${block.interpretation}`);
                }}
                className="group flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full border border-blue-100 dark:border-blue-900/30 hover:border-blue-200 dark:hover:border-blue-700 font-sans"
              >
                <Sparkles size={14} className="text-yellow-500 group-hover:animate-pulse" />
                <span>Gostaria de um exemplo prático?</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer: Jurisprudence (Collapsible) */}
      <div className={`transition-colors ${showJurisprudence ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : 'bg-slate-50 dark:bg-slate-800/50'}`}>
        <button 
          onClick={() => setShowJurisprudence(!showJurisprudence)}
          className="w-full flex items-center justify-between p-3 px-5 hover:bg-yellow-50 dark:hover:bg-slate-700 transition-colors text-left"
        >
          <div className="flex items-center gap-2 text-yellow-700 dark:text-yellow-500 font-bold text-sm font-sans">
             <Gavel size={16} />
             <span>Jurisprudência (STF/STJ)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">
              {showJurisprudence ? 'Ocultar' : 'Ver Detalhes'}
            </span>
            {showJurisprudence ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
          </div>
        </button>
        
        {showJurisprudence && (
          <div className="p-6 pt-2 border-t border-yellow-100 dark:border-yellow-900/30 animate-fadeIn bg-yellow-50/30 dark:bg-yellow-900/10">
             <div 
              className={`text-slate-800 dark:text-slate-200 leading-relaxed text-sm ${fontClass}`}
              dangerouslySetInnerHTML={{ __html: formatMarkdown(block.jurisprudence) }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Modal Component for Practical Examples
const ExampleModal: React.FC<{
  isOpen: boolean;
  loading: boolean;
  content: string | null;
  onClose: () => void;
}> = ({ isOpen, loading, content, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-lg border-2 border-emerald-500/30 animate-scaleIn overflow-hidden flex flex-col max-h-[80vh]">
        {/* Decorative header line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-emerald-500 to-yellow-400"></div>
        
        <div className="p-5 flex justify-between items-start border-b border-slate-100 dark:border-slate-800">
           <div className="flex items-center gap-2">
             <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
               <Lightbulb size={20} className="text-emerald-700 dark:text-emerald-400" />
             </div>
             <h3 className="text-lg font-bold text-slate-900 dark:text-white font-serif">Exemplo Prático</h3>
           </div>
           <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
             <X size={20} />
           </button>
        </div>

        <div className="p-6 overflow-y-auto custom-scrollbar">
          {loading ? (
             <div className="flex flex-col items-center justify-center py-8 space-y-4">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
               <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse font-sans">Criando um cenário fictício...</p>
             </div>
          ) : (
            <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-justify space-y-4 font-serif">
               {content ? content.split('\n').map((line, i) => (
                 line.trim() && <p key={i}>{line}</p>
               )) : (
                 <p className="text-red-500">Não foi possível gerar o exemplo.</p>
               )}
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 text-center">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold rounded-lg transition-colors font-sans"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, loading, onReset }) => {
  const [copied, setCopied] = useState(false);
  const [parsedBlocks, setParsedBlocks] = useState<AnalysisBlock[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);

  // Font settings
  const fontOptions = [
    { id: 'serif', label: 'Jurídico', class: 'font-serif' },
    { id: 'sans', label: 'Moderno', class: 'font-sans' },
    { id: 'arial', label: 'Simples', class: 'font-[Arial]' },
    { id: 'mono', label: 'Técnico', class: 'font-mono' },
  ];
  const [currentFont, setCurrentFont] = useState(fontOptions[0]);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);

  // Example Modal State
  const [isExampleModalOpen, setIsExampleModalOpen] = useState(false);
  const [exampleLoading, setExampleLoading] = useState(false);
  const [exampleContent, setExampleContent] = useState<string | null>(null);

  useEffect(() => {
    if (result) {
      // Parse the content
      const blocks = result.split('---').filter(b => b.trim().length > 10);
      
      const parsed = blocks.map((block, index) => {
        const cleanBlock = block; 
        const articleMatch = cleanBlock.match(/ARTIGO EM QUESTÃO:\*\*\s*\n([\s\S]*?)(?=>|📘|INTERPRETAÇÃO|$)/i);
        const interpMatch = cleanBlock.match(/INTERPRETAÇÃO:\*\*\s*\n([\s\S]*?)(?=>|⚖️|JURISPRUDÊNCIA|$)/i);
        const jurisMatch = cleanBlock.match(/JURISPRUDÊNCIA.*:\*\*\s*\n([\s\S]*?)(?=$)/i);

        return {
          id: `block-${index}`,
          article: articleMatch ? articleMatch[1].trim() : '',
          interpretation: interpMatch ? interpMatch[1].trim() : '',
          jurisprudence: jurisMatch ? jurisMatch[1].trim() : '',
          raw: block
        };
      });

      setParsedBlocks(parsed);
    } else {
      setParsedBlocks([]);
    }
  }, [result]);

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = (format: 'txt' | 'md') => {
    if (!result) return;
    
    const element = document.createElement("a");
    const file = new Blob([result], {type: 'text/plain;charset=utf-8'});
    const timestamp = new Date().toISOString().slice(0,10);
    
    element.href = URL.createObjectURL(file);
    element.download = `JusPatria-Parecer-${timestamp}.${format}`;
    document.body.appendChild(element); 
    element.click();
    document.body.removeChild(element);
    setIsDownloadMenuOpen(false);
  };

  const handleHighlight = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    
    if (contentRef.current && contentRef.current.contains(range.commonAncestorContainer)) {
      try {
        const span = document.createElement('span');
        span.className = 'bg-yellow-200 text-slate-900 px-0.5 rounded shadow-sm decoration-clone';
        // Simplified click-to-remove for extracted contents
        span.onclick = (e) => {
           // Unwrap logic would be more complex, for now we just remove the background
           const target = e.currentTarget as HTMLElement;
           target.className = '';
        };
        span.title = 'Clique para remover o destaque';
        
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
        selection.removeAllRanges();
      } catch (e) {
        console.warn("Could not highlight complex selection.", e);
      }
    }
  };

  const handleRequestExample = async (context: string) => {
    setIsExampleModalOpen(true);
    setExampleLoading(true);
    setExampleContent(null);
    
    const example = await generatePracticalExample(context);
    
    setExampleContent(example);
    setExampleLoading(false);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 p-8 min-h-[600px] flex flex-col items-center justify-center text-center h-full relative overflow-hidden transition-colors">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-900 via-yellow-400 to-emerald-800"></div>
        <div className="relative">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-emerald-800 dark:border-emerald-500 mb-6"></div>
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-lg"></div>
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 font-serif mb-2">JusPátria Analisa</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 max-w-md text-sm leading-relaxed font-sans">
          Nossa IA está cruzando o texto com a legislação vigente e buscando jurisprudência atualizada do STF e STJ...
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 p-8 min-h-[600px] flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 h-full relative transition-colors">
        <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <FileSignature size={40} className="text-slate-300 dark:text-slate-600" />
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-700 dark:text-slate-300 mb-3">Aguardando Documento</h3>
        <p className="text-sm max-w-sm mx-auto leading-relaxed font-sans">
          Seu parecer jurídico detalhado, com citações e análise do STF/STJ, aparecerá aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl shadow-slate-200/50 dark:shadow-black/20 border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden h-full transition-colors relative">
      
      {/* Example Modal */}
      <ExampleModal 
        isOpen={isExampleModalOpen}
        loading={exampleLoading}
        content={exampleContent}
        onClose={() => setIsExampleModalOpen(false)}
      />

      {/* Toolbar */}
      <div className="p-3 bg-blue-950 dark:bg-slate-950 text-white flex flex-wrap justify-between items-center gap-3 shadow-md relative z-20 border-b border-white/5">
        <div className="flex items-center gap-2 pl-2">
          <div className="p-1.5 bg-white/10 rounded-md">
             <FileSignature size={16} className="text-yellow-400" />
          </div>
          <div>
            <h3 className="font-bold tracking-wide text-xs uppercase text-white font-sans">Parecer Jurídico</h3>
            <p className="text-[10px] text-blue-200">Gerado por IA</p>
          </div>
        </div>
        
        <div className="flex gap-1 items-center flex-wrap">
          <div className="relative">
            <button
              onClick={() => setIsFontMenuOpen(!isFontMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100 hover:text-white transition-colors rounded hover:bg-white/10"
              title="Alterar Fonte"
            >
              <Type size={14} className="text-yellow-500" />
              <span className="hidden sm:inline font-sans">Fonte</span>
              <ChevronDown size={12} className={`transition-transform ${isFontMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isFontMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsFontMenuOpen(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-44 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-20 text-slate-800 dark:text-slate-200 animate-fadeIn">
                  {fontOptions.map((font) => (
                    <button
                      key={font.id}
                      onClick={() => {
                        setCurrentFont(font);
                        setIsFontMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-between transition-colors font-sans ${
                        currentFont.id === font.id ? 'text-blue-900 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-900/20' : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      <span className={font.class}>{font.label}</span>
                      {currentFont.id === font.id && <Check size={14} className="text-blue-600 dark:text-blue-400" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => setIsDownloadMenuOpen(!isDownloadMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100 hover:text-white transition-colors rounded hover:bg-white/10"
              title="Baixar Arquivo"
            >
              <Download size={14} className="text-yellow-500" />
              <span className="hidden sm:inline font-sans">Baixar</span>
              <ChevronDown size={12} className={`transition-transform ${isDownloadMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isDownloadMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setIsDownloadMenuOpen(false)}></div>
                <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-20 text-slate-800 dark:text-slate-200 animate-fadeIn">
                  <button onClick={() => handleDownload('txt')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300 border-b border-slate-50 dark:border-slate-700 font-sans">
                    <FileText size={16} className="text-slate-400" />
                    Salvar como .TXT
                  </button>
                  <button onClick={() => handleDownload('md')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 text-slate-700 dark:text-slate-300 font-sans">
                    <FileSignature size={16} className="text-slate-400" />
                    Salvar como .MD
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={handleHighlight}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100 hover:text-white transition-colors rounded hover:bg-white/10"
            title="Selecione um texto e clique aqui"
          >
            <Highlighter size={14} className="text-yellow-500" />
            <span className="hidden sm:inline font-sans">Grifar</span>
          </button>
          
          <div className="w-px bg-white/20 h-6 mx-2"></div>
          
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-blue-100 hover:text-white transition-colors"
          >
            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
            <span className="font-sans">{copied ? 'Copiado' : 'Copiar'}</span>
          </button>
          
          <button
            onClick={onReset}
            className="ml-2 flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-yellow-500 border border-yellow-500/50 bg-yellow-500/10 rounded hover:bg-yellow-500/20 transition-colors"
          >
            <RotateCcw size={14} />
            <span className="font-sans">Nova Análise</span>
          </button>
        </div>
      </div>
      
      {/* Document Content */}
      <div className="flex-1 p-6 sm:p-8 overflow-y-auto max-h-[800px] bg-slate-100 dark:bg-slate-950 relative custom-scrollbar transition-colors">
        <div className="max-w-4xl mx-auto" ref={contentRef}>
           <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 font-sans">
                <Highlighter size={16} className="text-yellow-600 dark:text-yellow-500" />
                <span>Selecione o texto e clique na caneta para grifar.</span>
              </div>
           </div>

           {/* Cards Container */}
           <div className="space-y-4">
             {parsedBlocks.length > 0 ? (
               parsedBlocks.map((block) => (
                 <AnalysisCard 
                   key={block.id} 
                   block={block} 
                   fontClass={currentFont.class} 
                   onAskExample={handleRequestExample}
                 />
               ))
             ) : (
                // Fallback for non-parsed text
                <div 
                   className={`bg-white dark:bg-slate-800 p-8 rounded-xl shadow-sm leading-loose text-slate-800 dark:text-slate-200 whitespace-pre-wrap text-justify ${currentFont.class}`}
                   dangerouslySetInnerHTML={{ __html: formatMarkdown(result) }}
                />
             )}
           </div>
           
           <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 dark:text-slate-500 font-sans gap-2">
             <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Processado por JusPátria AI</span>
             </div>
             <span>Documento confidencial gerado para fins informativos.</span>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ResultDisplay;