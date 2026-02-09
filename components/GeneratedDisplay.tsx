import React from 'react';

interface Props {
  imageUrl: string | null;
  loading: boolean;
  error: string | null;
}

export const GeneratedDisplay: React.FC<Props> = ({ imageUrl, loading, error }) => {
  if (error) {
    return (
      <div className="w-full aspect-[3/4] bg-slate-800/30 border border-red-900/50 rounded-2xl flex items-center justify-center p-6 text-center">
        <div className="text-red-400">
          <p className="font-bold mb-2">Erro na Geração</p>
          <p className="text-sm opacity-80">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="w-full aspect-[3/4] bg-slate-800/30 border border-slate-700 rounded-2xl flex flex-col items-center justify-center p-6 text-center animate-pulse">
        <div className="w-16 h-16 border-4 border-gold-500/30 border-t-gold-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gold-500 font-serif text-lg">Criando sua Joia...</p>
        <p className="text-slate-400 text-xs mt-2">A inteligência artificial está processando os detalhes.</p>
      </div>
    );
  }

  if (!imageUrl) {
    return (
      <div className="w-full aspect-[3/4] bg-slate-800/30 border border-slate-700 border-dashed rounded-2xl flex items-center justify-center p-6 text-center">
        <div className="text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="font-serif">O resultado aparecerá aqui</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-gold-600/30 shadow-2xl shadow-black/50">
      <img src={imageUrl} alt="Resultado Gerado" className="w-full h-auto" />
      <div className="bg-slate-900 p-4 flex justify-between items-center border-t border-slate-800">
        <span className="text-xs text-slate-400 uppercase tracking-widest">LuxeLens AI</span>
        <a 
          href={imageUrl} 
          download={`luxelens-jewelry-${Date.now()}.png`}
          className="text-gold-500 hover:text-gold-400 text-sm font-semibold flex items-center gap-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Baixar
        </a>
      </div>
    </div>
  );
};
