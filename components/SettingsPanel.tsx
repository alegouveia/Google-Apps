import React from 'react';
import { Settings, Users, Volume2, Layout, AlignLeft } from 'lucide-react';
import { AudienceType, FormatType, InterpretationConfig, LengthType, ToneType } from '../types';

interface SettingsPanelProps {
  config: InterpretationConfig;
  setConfig: React.Dispatch<React.SetStateAction<InterpretationConfig>>;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({ config, setConfig }) => {
  
  const updateConfig = (key: keyof InterpretationConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl shadow-lg shadow-slate-200/50 dark:shadow-black/20 border border-slate-100 dark:border-slate-800 p-6 relative overflow-hidden transition-colors">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-50 dark:bg-yellow-900/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="flex items-center gap-3 mb-8 text-slate-900 dark:text-slate-100 pb-4 border-b border-slate-100 dark:border-slate-800 relative z-10">
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-900 dark:text-blue-400">
          <Settings size={18} />
        </div>
        <h2 className="font-bold text-lg font-serif text-slate-800 dark:text-slate-100">Parâmetros da Análise</h2>
      </div>

      <div className="space-y-8 relative z-10">
        {/* Audience */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider font-sans">
            <Users size={16} className="text-emerald-600 dark:text-emerald-400" />
            Público Alvo
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {Object.values(AudienceType).map((audience) => (
              <button
                key={audience}
                onClick={() => updateConfig('audience', audience)}
                className={`py-2.5 px-3 rounded-lg text-xs font-semibold border transition-all font-sans ${
                  config.audience === audience
                    ? 'bg-blue-950 dark:bg-blue-700 text-white border-blue-950 dark:border-blue-700 shadow-md transform scale-[1.02]'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-900 dark:hover:text-blue-300'
                }`}
              >
                {audience}
              </button>
            ))}
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider font-sans">
            <Volume2 size={16} className="text-emerald-600 dark:text-emerald-400" />
            Tom da Explicação
          </label>
          <div className="relative">
            <select
              value={config.tone}
              onChange={(e) => updateConfig('tone', e.target.value as ToneType)}
              className="w-full p-3 pl-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-lg focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 appearance-none font-medium transition-shadow cursor-pointer hover:border-slate-300 dark:hover:border-slate-600 font-sans"
            >
              {Object.values(ToneType).map((tone) => (
                <option key={tone} value={tone}>{tone}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
              <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
            </div>
          </div>
        </div>

        {/* Format */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider font-sans">
            <Layout size={16} className="text-emerald-600 dark:text-emerald-400" />
            Formato de Saída
          </label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(FormatType).map((format) => (
              <button
                key={format}
                onClick={() => updateConfig('format', format)}
                className={`py-2.5 px-4 rounded-lg text-xs font-semibold border transition-all text-left flex items-center justify-between font-sans ${
                  config.format === format
                    ? 'bg-blue-950 dark:bg-blue-700 text-white border-blue-950 dark:border-blue-700 shadow-md'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:text-blue-900 dark:hover:text-blue-300'
                }`}
              >
                {format}
                {config.format === format && <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>}
              </button>
            ))}
          </div>
        </div>

        {/* Length */}
        <div>
          <label className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider font-sans">
            <AlignLeft size={16} className="text-emerald-600 dark:text-emerald-400" />
            Profundidade
          </label>
          <div className="relative pt-6 pb-2 px-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <input
              type="range"
              min="0"
              max="2"
              step="1"
              value={Object.values(LengthType).indexOf(config.length)}
              onChange={(e) => updateConfig('length', Object.values(LengthType)[parseInt(e.target.value)])}
              className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg appearance-none cursor-pointer accent-emerald-700 hover:accent-emerald-600 transition-all"
            />
            <div className="flex justify-between mt-4 text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 font-sans">
              <span className={config.length === LengthType.CONCISE ? 'text-emerald-800 dark:text-emerald-400' : ''}>Conciso</span>
              <span className={config.length === LengthType.MODERATE ? 'text-emerald-800 dark:text-emerald-400' : ''}>Moderado</span>
              <span className={config.length === LengthType.DETAILED ? 'text-emerald-800 dark:text-emerald-400' : ''}>Detalhado</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;