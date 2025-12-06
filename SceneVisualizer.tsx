import React, { useState } from 'react';
import { ScriptResponse, Character, GeneratedImage, Scene } from '../types';
import { generateSceneImage } from '../services/geminiService';
import { Camera, Check, Download, Image as ImageIcon, Loader2, RefreshCw } from 'lucide-react';

interface Props {
  script: ScriptResponse;
  characters: Character[];
}

const SceneVisualizer: React.FC<Props> = ({ script, characters }) => {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [generatingSceneId, setGeneratingSceneId] = useState<number | null>(null);
  
  // Track selected characters for each scene
  const [sceneCharSelections, setSceneCharSelections] = useState<Record<number, Set<string>>>({});

  const toggleCharacterForScene = (sceneNum: number, charId: string) => {
    setSceneCharSelections(prev => {
      const currentSet = new Set(prev[sceneNum] || []);
      if (currentSet.has(charId)) {
        currentSet.delete(charId);
      } else {
        currentSet.add(charId);
      }
      return { ...prev, [sceneNum]: currentSet };
    });
  };

  const handleGenerateImage = async (scene: Scene) => {
    setGeneratingSceneId(scene.sceneNumber);
    
    const selectedIds = sceneCharSelections[scene.sceneNumber] || new Set();
    const activeCharacters = characters.filter(c => selectedIds.has(c.id));

    try {
      const imageUrl = await generateSceneImage(scene.visualPrompt, activeCharacters);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        sceneNumber: scene.sceneNumber,
        imageUrl: imageUrl,
        promptUsed: scene.visualPrompt
      };

      setGeneratedImages(prev => {
        const filtered = prev.filter(img => img.sceneNumber !== scene.sceneNumber);
        return [...filtered, newImage];
      });

    } catch (error) {
      console.error(error);
      alert("Суретті жасау сәтсіз аяқталды.");
    } finally {
      setGeneratingSceneId(null);
    }
  };

  const getSceneImage = (sceneNum: number) => generatedImages.find(img => img.sceneNumber === sceneNum);

  return (
    <div className="space-y-6 mt-8 pb-20">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
          {script.title}
        </h1>
        <p className="text-slate-500 text-sm uppercase tracking-widest">{script.genre} • {script.scenes.length} Кадр</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {script.scenes.map((scene) => {
          const generatedImg = getSceneImage(scene.sceneNumber);
          const selectedIds = sceneCharSelections[scene.sceneNumber] || new Set();
          const isGenerating = generatingSceneId === scene.sceneNumber;

          return (
            <div key={scene.sceneNumber} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
              
              {/* Header: Just Scene Number */}
              <div className="bg-slate-800/50 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Кадр {scene.sceneNumber}
                </span>
                {generatedImg && (
                  <a 
                    href={generatedImg.imageUrl} 
                    download={`scene-${scene.sceneNumber}.png`}
                    className="text-slate-400 hover:text-white transition-colors"
                    title="Жүктеу"
                  >
                    <Download size={16} />
                  </a>
                )}
              </div>

              {/* Image Area */}
              <div className="aspect-video bg-black relative group">
                {generatedImg ? (
                  <>
                    <img 
                      src={generatedImg.imageUrl} 
                      alt={`Scene ${scene.sceneNumber}`} 
                      className="w-full h-full object-cover"
                    />
                    {/* Hover Overlay for Regenerate */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button
                        onClick={() => handleGenerateImage(scene)}
                        className="bg-white/10 hover:bg-white/20 backdrop-blur text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all border border-white/20"
                       >
                         <RefreshCw size={16} /> Жаңарту
                       </button>
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 bg-slate-950">
                    {isGenerating ? (
                       <div className="flex flex-col items-center gap-2 text-blue-500">
                         <Loader2 className="animate-spin" size={32} />
                         <span className="text-xs animate-pulse">Салынуда...</span>
                       </div>
                    ) : (
                       <div className="flex flex-col items-center gap-2">
                         <ImageIcon size={32} />
                         <span className="text-xs">Сурет жоқ</span>
                       </div>
                    )}
                  </div>
                )}
              </div>

              {/* Controls */}
              <div className="p-4 bg-slate-900 flex-1 flex flex-col justify-end">
                {/* Character Selector - Compact */}
                {characters.length > 0 && !isGenerating && (
                  <div className="mb-4">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-2">Кейіпкерлер:</p>
                    <div className="flex flex-wrap gap-2">
                      {characters.map(char => {
                        const isSelected = selectedIds.has(char.id);
                        return (
                          <button
                            key={char.id}
                            onClick={() => toggleCharacterForScene(scene.sceneNumber, char.id)}
                            className={`
                              w-8 h-8 rounded-full border-2 overflow-hidden transition-all relative
                              ${isSelected ? 'border-blue-500 opacity-100 ring-2 ring-blue-500/30' : 'border-slate-700 opacity-50 hover:opacity-100'}
                            `}
                            title={char.name}
                          >
                            <img src={char.imageBase64} alt={char.name} className="w-full h-full object-cover" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-blue-500/40 flex items-center justify-center">
                                <Check size={12} className="text-white" />
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Generate Button */}
                {!generatedImg && (
                  <button
                    onClick={() => handleGenerateImage(scene)}
                    disabled={isGenerating}
                    className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 text-white py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all"
                  >
                    {isGenerating ? 'Күтіңіз...' : 'Фото жасау'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SceneVisualizer;