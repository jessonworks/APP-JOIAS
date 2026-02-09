import React, { useRef } from 'react';
import { ImageFile } from '../types';

interface Props {
  label: string;
  image: ImageFile | null;
  onUpload: (file: ImageFile) => void;
  onRemove: () => void;
}

export const ImageUpload: React.FC<Props> = ({ label, image, onUpload, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      let base64String = reader.result as string;
      let mimeType = file.type;

      // Fix: Some browsers/OSs don't populate file.type for certain extensions.
      // We attempt to infer it from the extension or set a default to ensure 
      // the preview works and the API doesn't crash.
      if (!mimeType || mimeType === '') {
        const ext = file.name.split('.').pop()?.toLowerCase();
        if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'webp') mimeType = 'image/webp';
        else if (ext === 'heic') mimeType = 'image/heic';
        else mimeType = 'image/jpeg'; // Default fallback

        // Fix broken data URI for preview if mimeType was missing in FileReader result
        // FileReader might produce "data:;base64,..." if type is unknown
        if (base64String.startsWith('data:;base64,')) {
          base64String = base64String.replace('data:;base64,', `data:${mimeType};base64,`);
        } else if (base64String.startsWith('data:application/octet-stream;base64,')) {
           base64String = base64String.replace('data:application/octet-stream;base64,', `data:${mimeType};base64,`);
        }
      }

      onUpload({
        file,
        preview: base64String,
        base64: base64String,
        mimeType: mimeType,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <span className="text-sm font-medium text-slate-300 uppercase tracking-wide">{label}</span>
      
      {!image ? (
        <div 
          onClick={() => inputRef.current?.click()}
          className="h-48 w-full border-2 border-dashed border-slate-600 rounded-xl bg-slate-800/50 hover:bg-slate-800 hover:border-gold-500 transition-colors cursor-pointer flex flex-col items-center justify-center p-4"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-slate-400 text-sm text-center">Clique para carregar foto</span>
        </div>
      ) : (
        <div className="relative h-48 w-full rounded-xl overflow-hidden border border-slate-600 group">
          <img src={image.preview} alt="Preview" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
             <button 
              onClick={onRemove}
              className="bg-red-500 text-white px-3 py-1 rounded-full text-sm hover:bg-red-600"
            >
              Remover
            </button>
          </div>
        </div>
      )}

      <input 
        type="file" 
        accept="image/*" 
        ref={inputRef} 
        className="hidden" 
        onChange={handleFileChange}
      />
    </div>
  );
};