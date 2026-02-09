
import React, { useState, useEffect } from 'react';
import { AspectRatio, GeneratorMode, ImageFile } from './types';
import { generateCatalogImage, generateCreativeImage, editImage } from './services/geminiService';
import { ImageUpload } from './components/ImageUpload';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { GeneratedDisplay } from './components/GeneratedDisplay';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { supabase, isSupabaseConfigured } from './services/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [view, setView] = useState<'app' | 'dashboard'>('app');
  const [mode, setMode] = useState<GeneratorMode>(GeneratorMode.CATALOG);
  const [isDemo, setIsDemo] = useState(false);
  
  // State for Catalog Mode
  const [jewelryImage, setJewelryImage] = useState<ImageFile | null>(null);
  const [referenceImage, setReferenceImage] = useState<ImageFile | null>(null);
  
  // State for Creative/Edit Mode
  const [textPrompt, setTextPrompt] = useState<string>('');
  const [editSourceImage, setEditSourceImage] = useState<ImageFile | null>(null);

  // Shared State
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>(AspectRatio.SQUARE);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      console.warn("Supabase não configurado. Entrando em modo de demonstração.");
      setIsDemo(true);
      setLoadingSession(false);
      return;
    }

    supabase?.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingSession(false);
    }).catch(() => {
      setIsDemo(true);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    if (supabase) await supabase.auth.signOut();
    setUser(null);
  };

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);
    setGeneratedUrl(null);

    try {
      let resultUrl = '';

      if (mode === GeneratorMode.CATALOG) {
        if (!jewelryImage || !referenceImage) {
          throw new Error("Por favor, carregue a foto da joia e a referência.");
        }
        resultUrl = await generateCatalogImage(
          jewelryImage.base64,
          jewelryImage.mimeType,
          referenceImage.base64,
          referenceImage.mimeType,
          aspectRatio
        );
      } else if (mode === GeneratorMode.CREATIVE) {
        if (!textPrompt) throw new Error("Por favor, insira um prompt.");
        resultUrl = await generateCreativeImage(textPrompt, aspectRatio);
      } else if (mode === GeneratorMode.EDIT) {
         if (!editSourceImage || !textPrompt) throw new Error("Imagem e instruções necessárias.");
         resultUrl = await editImage(editSourceImage.base64, editSourceImage.mimeType, textPrompt);
      }

      setGeneratedUrl(resultUrl);

      // Salvar no banco apenas se configurado e logado
      if (user && resultUrl && supabase) {
        await supabase.from('generations').insert({
          user_id: user.id,
          image_url: resultUrl,
          mode: mode,
          aspect_ratio: aspectRatio,
          prompt: textPrompt || 'Catalog Composition'
        });
      }

    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro na geração da imagem.");
    } finally {
      setLoading(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-500/20 border-t-gold-500 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Se não estiver configurado ou não tiver usuário e não for demo, mostra login
  if (!isDemo && !user) {
    return <Login onLoginSuccess={() => setView('app')} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-gold-500/30">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-tr from-gold-600 to-gold-400 rounded-full flex items-center justify-center shadow-gold-500/20 shadow-lg cursor-pointer" onClick={() => setView('app')}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-slate-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-serif text-white tracking-wide">Luxe<span className="text-gold-500">Lens</span></h1>
            {isDemo && <span className="text-[10px] bg-gold-500/10 text-gold-500 border border-gold-500/20 px-2 py-0.5 rounded-full font-bold">DEMO</span>}
          </div>

          <nav className="flex gap-1 items-center">
            <button 
              onClick={() => setView('app')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'app' ? 'bg-slate-800 text-gold-500' : 'text-slate-400 hover:text-white'}`}
            >
              Gerador
            </button>
            {!isDemo && (
              <button 
                onClick={() => setView('dashboard')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-slate-800 text-gold-500' : 'text-slate-400 hover:text-white'}`}
              >
                Histórico
              </button>
            )}
            <div className="h-6 w-px bg-slate-800 mx-2"></div>
            {isDemo ? (
               <div className="text-xs text-slate-500 hidden md:block">Configure o Supabase para salvar</div>
            ) : (
              <button 
                onClick={handleLogout}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
              >
                Sair
              </button>
            )}
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {view === 'dashboard' && !isDemo ? (
          <Dashboard />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Left Column: Controls */}
            <div className="lg:col-span-5 flex flex-col gap-6">
              
              <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                <nav className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-xl border border-slate-800">
                    <button onClick={() => setMode(GeneratorMode.CATALOG)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${mode === GeneratorMode.CATALOG ? 'bg-gold-500 text-slate-950' : 'text-slate-400'}`}>CATÁLOGO</button>
                    <button onClick={() => setMode(GeneratorMode.CREATIVE)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${mode === GeneratorMode.CREATIVE ? 'bg-gold-500 text-slate-950' : 'text-slate-400'}`}>CRIATIVO</button>
                    <button onClick={() => setMode(GeneratorMode.EDIT)} className={`flex-1 py-2 rounded-lg text-[10px] font-bold transition-all ${mode === GeneratorMode.EDIT ? 'bg-gold-500 text-slate-950' : 'text-slate-400'}`}>EDITOR</button>
                </nav>

                <div className="mb-6">
                  <h2 className="text-2xl font-serif text-white mb-2">
                    {mode === GeneratorMode.CATALOG && 'Gerador de Catálogo'}
                    {mode === GeneratorMode.CREATIVE && 'Criação do Zero'}
                    {mode === GeneratorMode.EDIT && 'Edição com IA'}
                  </h2>
                  <p className="text-xs text-slate-400">
                    {mode === GeneratorMode.CATALOG && 'Envie sua joia e uma foto de inspiração lateral.'}
                    {mode === GeneratorMode.CREATIVE && 'Descreva a joia que você imagina.'}
                    {mode === GeneratorMode.EDIT && 'Altere fundos ou cores da imagem enviada.'}
                  </p>
                </div>

                <div className="space-y-6">
                  {mode !== GeneratorMode.EDIT && (
                    <AspectRatioSelector selected={aspectRatio} onSelect={setAspectRatio} disabled={loading} />
                  )}

                  {mode === GeneratorMode.CATALOG && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ImageUpload 
                        label="Sua Joia" 
                        image={jewelryImage} 
                        onUpload={setJewelryImage} 
                        onRemove={() => setJewelryImage(null)} 
                      />
                      <ImageUpload 
                        label="Inspiração" 
                        image={referenceImage} 
                        onUpload={setReferenceImage} 
                        onRemove={() => setReferenceImage(null)} 
                      />
                    </div>
                  )}

                  {mode === GeneratorMode.CREATIVE && (
                    <textarea
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder="Ex: Anel de esmeralda em um pedestal de mármore branco com luz solar suave..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-gold-500 outline-none h-32 resize-none"
                    />
                  )}

                  {mode === GeneratorMode.EDIT && (
                    <>
                      <ImageUpload label="Foto Original" image={editSourceImage} onUpload={setEditSourceImage} onRemove={() => setEditSourceImage(null)} />
                      <textarea
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        placeholder="Ex: Mude o fundo para um deserto ao pôr do sol..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white text-sm focus:ring-2 focus:ring-gold-500 outline-none h-24 resize-none"
                      />
                    </>
                  )}

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-bold text-slate-900 uppercase tracking-widest transition-all
                      ${loading ? 'bg-slate-700 text-slate-400' : 'bg-gradient-to-r from-gold-400 to-gold-600 hover:brightness-110 active:scale-95 shadow-lg shadow-gold-500/20'}`}
                  >
                    {loading ? 'Processando...' : 'Gerar Resultado'}
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7">
              <div className="sticky top-24">
                <GeneratedDisplay imageUrl={generatedUrl} loading={loading} error={error} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
