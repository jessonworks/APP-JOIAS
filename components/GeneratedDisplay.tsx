
import React from 'react';

interface Props {
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

export const GeneratedDisplay: React.FC<Props> = ({ imageUrl, loading, error }) => {
  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `luxelens-jewelry-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (error) {
    return (
      <div className="w-full aspect-square bg-slate-800/30 border border-red-900/50 rounded-2xl flex items-center justify-center p-6 text-center">
        <div className="text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-bold mb-2">Ops! Algo deu errado</p>
          <p className="text-xs opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <div className={`relative w-full aspect-square bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center transition-all duration-700 ${loading ? 'opacity-50 grayscale' : 'opacity-100'}`}>
        
        {!imageUrl && !loading && (
          <div className="text-center p-12">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 00-2 2z" />
              </svg>
            </div>
            <p className="text-slate-500 font-serif italic">Aguardando sua criação de luxo...</p>
          </div>
        )}

        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/40 backdrop-blur-sm z-10">
            <div className="w-16 h-16 border-4 border-gold-500/10 border-t-gold-500 rounded-full animate-spin mb-4"></div>
            <p className="text-gold-500 font-medium animate-pulse text-sm uppercase tracking-widest">Processando Imagem</p>
          </div>
        )}

        {imageUrl && !loading && (
          <img 
            src={imageUrl} 
            alt="Joia Gerada" 
            className="w-full h-full object-contain animate-in fade-in zoom-in duration-1000"
          />
        )}
      </div>

      {imageUrl && !loading && (
        <button
          onClick={handleDownload}
          className="w-full py-4 bg-slate-800 hover:bg-gold-500 hover:text-slate-900 border border-gold-500/30 text-gold-500 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group shadow-xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          BAIXAR FOTO EM ALTA RESOLUÇÃO
        </button>
      )}
    </div>
  );
};
