import React, { useState } from 'react';
import { Character, ScriptResponse } from './types';
import CharacterUploader from './components/CharacterUploader';
import ScriptGenerator from './components/ScriptGenerator';
import SceneVisualizer from './components/SceneVisualizer';
import { Film } from 'lucide-react';

const App: React.FC = () => {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [script, setScript] = useState<ScriptResponse | null>(null);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/20">
              <Film className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">CineCraft <span className="text-blue-500">AI</span></h1>
          </div>
          <div className="text-sm text-slate-400 hidden sm:block">
            Визуалды Сценарий Жасақтаушы
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        
        {/* Intro Text */}
        {!script && (
          <div className="text-center mb-10 space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              Идеяңызды фильмге айналдырыңыз
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              Кейіпкерлеріңіздің фотосын жүктеңіз, идеяңызды жазыңыз, және жасанды интеллект сізге толық сценарий мен кадрларды дайындап берсін.
            </p>
          </div>
        )}

        {/* Step 1: Characters */}
        <CharacterUploader characters={characters} setCharacters={setCharacters} />

        {/* Step 2: Script Generation */}
        {!script && (
          <ScriptGenerator onScriptGenerated={setScript} />
        )}

        {/* Step 3: Visualization */}
        {script && (
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
             <div className="flex justify-between items-center mt-12 mb-4">
                <h3 className="text-xl font-semibold text-white">Жоба тақтасы (Storyboard)</h3>
                <button 
                  onClick={() => setScript(null)} 
                  className="text-sm text-slate-400 hover:text-white underline"
                >
                  Жаңа сценарий бастау
                </button>
             </div>
             <SceneVisualizer script={script} characters={characters} />
          </div>
        )}

      </main>

      <footer className="bg-slate-900 border-t border-slate-800 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>© 2024 CineCraft AI. Gemini API арқылы жасалған.</p>
        </div>
      </footer>
    </div>
  );
};

export default App;