import React, { useState } from 'react';
import { generateScript } from '../services/geminiService';
import { ScriptResponse } from '../types';
import { FileText, Loader2, Sparkles } from 'lucide-react';

interface Props {
  onScriptGenerated: (script: ScriptResponse) => void;
}

const ScriptGenerator: React.FC<Props> = ({ onScriptGenerated }) => {
  const [topic, setTopic] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setIsLoading(true);
    setError(null);
    try {
      const script = await generateScript(topic);
      onScriptGenerated(script);
    } catch (err) {
      setError("Сценарийді жасау кезінде қате кетті. Қайталап көріңіз.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 mt-6">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-purple-400">
        <FileText size={24} />
        Сценарий Жазу
      </h2>
      
      <div className="flex flex-col gap-4">
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="Сценарий не туралы болсын? (Мысалы: Алматыдағы ғарышкерлердің шытырман оқиғасы...)"
          className="w-full h-32 bg-slate-900 border border-slate-600 rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
        
        {error && <p className="text-red-400 text-sm">{error}</p>}

        <button
          onClick={handleGenerate}
          disabled={isLoading || !topic.trim()}
          className={`
            flex items-center justify-center gap-2 py-3 px-6 rounded-lg font-bold text-white transition-all
            ${isLoading || !topic.trim() ? 'bg-slate-600 cursor-not-allowed' : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-900/50'}
          `}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" size={20} /> Жазылуда...
            </>
          ) : (
            <>
              <Sparkles size={20} /> Сценарийді Жасау
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ScriptGenerator;
