import React, { useRef, useState } from 'react';
import { Character } from '../types';
import { Plus, X, User } from 'lucide-react';

interface Props {
  characters: Character[];
  setCharacters: React.Dispatch<React.SetStateAction<Character[]>>;
}

const CharacterUploader: React.FC<Props> = ({ characters, setCharacters }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [nameInput, setNameInput] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (characters.length >= 5) {
      alert("Ең көп дегенде 5 кейіпкер жүктей аласыз.");
      return;
    }

    if (!nameInput.trim()) {
      alert("Алдымен кейіпкердің атын жазыңыз.");
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      const newChar: Character = {
        id: Date.now().toString(),
        name: nameInput,
        imageBase64: base64,
        mimeType: file.type
      };
      setCharacters([...characters, newChar]);
      setNameInput(''); // Reset name input
      if (fileInputRef.current) fileInputRef.current.value = ''; // Reset file input
    };
    reader.readAsDataURL(file);
  };

  const removeCharacter = (id: string) => {
    setCharacters(characters.filter(c => c.id !== id));
  };

  return (
    <div className="bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-blue-400">
        <User size={24} />
        Кейіпкерлерді Жүктеу (Макс 5)
      </h2>
      
      <div className="flex flex-wrap gap-4 mb-6">
        {characters.map((char) => (
          <div key={char.id} className="relative group w-24">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-blue-500 shadow-md">
              <img src={char.imageBase64} alt={char.name} className="w-full h-full object-cover" />
            </div>
            <p className="text-center text-sm mt-2 truncate font-medium">{char.name}</p>
            <button 
              onClick={() => removeCharacter(char.id)}
              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={14} />
            </button>
          </div>
        ))}
        
        {characters.length < 5 && (
          <div className="flex flex-col gap-2 w-full sm:w-auto">
             <input
              type="text"
              placeholder="Кейіпкер аты (Мысалы: Арман)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="bg-slate-900 border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 w-full"
            />
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-32 h-10 border-2 border-dashed border-slate-600 rounded-lg flex items-center justify-center cursor-pointer hover:border-blue-400 hover:text-blue-400 transition-colors"
            >
              <span className="text-sm font-medium flex items-center gap-1">
                 <Plus size={16} /> Фото қосу
              </span>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              className="hidden" 
            />
          </div>
        )}
      </div>
      <p className="text-xs text-slate-400">
        Нұсқаулық: Алдымен кейіпкердің атын жазыңыз, содан кейін оның анық фотосуретін жүктеңіз. Бұл фотолар сценарийге сәйкес суреттерді жасау үшін қолданылады.
      </p>
    </div>
  );
};

export default CharacterUploader;
