
import React, { useState, useEffect } from 'react';
import { AspectRatio, GeneratorMode, ImageFile } from './types';
import { generateCatalogImage, generateCreativeImage, editImage } from './services/geminiService';
import { ImageUpload } from './components/ImageUpload';
import { AspectRatioSelector } from './components/AspectRatioSelector';
import { GeneratedDisplay } from './components/GeneratedDisplay';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  const [view, setView] = useState<'app' | 'dashboard'>('app');
  const [mode, setMode] = useState<GeneratorMode>(GeneratorMode.CATALOG);
  
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

  const isConfigured = !!(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

  useEffect(() => {
    if (!isConfigured) {
      setLoadingSession(false);
      return;
    }

    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoadingSession(false);
    }).catch(err => {
      console.error("Auth session check failed:", err);
      setLoadingSession(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
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
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Ocorreu um erro desconhecido.");
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

  if (!isConfigured) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-slate-900 p-8 rounded-3xl border border-red-500/30">
          <div className="text-4xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-white mb-4">Configuração Necessária</h1>
          <p className="text-slate-400 mb-6">
            O Supabase não foi configurado corretamente. Adicione as variáveis de ambiente 
            <code className="bg-slate-800 text-gold-500 px-2 py-1 rounded mx-1 text-sm font-mono">SUPABASE_URL</code> e 
            <code className="bg-slate-800 text-gold-500 px-2 py-1 rounded mx-1 text-sm font-mono">SUPABASE_ANON_KEY</code> no Vercel.
          </p>
          <div className="text-xs text-slate-500 bg-slate-950 p-4 rounded-xl text-left font-mono">
            Vá em Vercel > Settings > Environment Variables
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
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
          </div>

          <nav className="hidden lg:flex gap-1 items-center">
            <button 
              onClick={() => setView('app')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'app' ? 'bg-slate-800 text-gold-500' : 'text-slate-400 hover:text-white'}`}
            >
              Gerador AI
            </button>
            <button 
              onClick={() => setView('dashboard')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${view === 'dashboard' ? 'bg-slate-800 text-gold-500' : 'text-slate-400 hover:text-white'}`}
            >
              Dashboard
            </button>
            <div className="h-6 w-px bg-slate-800 mx-2"></div>
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-400/10 transition-all"
            >
              Sair
            </button>
          </nav>
          
          <button className="lg:hidden text-slate-400" onClick={() => setView(view === 'app' ? 'dashboard' : 'app')}>
             {view === 'app' ? '📊' : '🎨'}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 md:py-12">
        {view === 'dashboard' ? (
          <Dashboard />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 animate-in fade-in duration-500">
            {/* Left Column: Controls */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              
              <div>
                <nav className="flex gap-2 mb-6 bg-slate-900 p-1 rounded-xl border border-slate-800 w-fit">
                    <button onClick={() => setMode(GeneratorMode.CATALOG)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === GeneratorMode.CATALOG ? 'bg-gold-500 text-slate-950' : 'text-slate-400'}`}>CATÁLOGO</button>
                    <button onClick={() => setMode(GeneratorMode.CREATIVE)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === GeneratorMode.CREATIVE ? 'bg-gold-500 text-slate-950' : 'text-slate-400'}`}>CRIATIVO</button>
                    <button onClick={() => setMode(GeneratorMode.EDIT)} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${mode === GeneratorMode.EDIT ? 'bg-gold-500 text-slate-950' : 'text-slate-400'}`}>EDITOR</button>
                </nav>

                <h2 className="text-3xl font-serif text-white mb-2">
                  {mode === GeneratorMode.CATALOG && 'Criador de Catálogo'}
                  {mode === GeneratorMode.CREATIVE && 'Estúdio Criativo'}
                  {mode === GeneratorMode.EDIT && 'Editor Mágico'}
                </h2>
                <p className="text-slate-400 leading-relaxed">
                  {mode === GeneratorMode.CATALOG && 'Combine a foto real da sua joia com uma referência de estilo. A IA preserva as dimensões originais da peça.'}
                  {mode === GeneratorMode.CREATIVE && 'Descreva sua visão e deixe o Imagen 4 gerar imagens deslumbrantes do zero.'}
                  {mode === GeneratorMode.EDIT && 'Faça ajustes rápidos usando linguagem natural.'}
                </p>
              </div>

              <div className="space-y-6 bg-slate-900/50 p-6 rounded-2xl border border-slate-800">
                {mode !== GeneratorMode.EDIT && (
                  <AspectRatioSelector selected={aspectRatio} onSelect={setAspectRatio} disabled={loading} />
                )}

                {mode === GeneratorMode.CATALOG && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <ImageUpload 
                        label="Sua Joia" 
                        image={jewelryImage} 
                        onUpload={setJewelryImage} 
                        onRemove={() => setJewelryImage(null)} 
                      />
                      <ImageUpload 
                        label="Referência" 
                        image={referenceImage} 
                        onUpload={setReferenceImage} 
                        onRemove={() => setReferenceImage(null)} 
                      />
                    </div>
                  </>
                )}

                {mode === GeneratorMode.CREATIVE && (
                  <div className="space-y-3">
                    <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">Prompt de Criação</label>
                    <textarea
                      value={textPrompt}
                      onChange={(e) => setTextPrompt(e.target.value)}
                      placeholder="Ex: Um colar de diamantes flutuando sobre água escura com reflexos dourados..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none resize-none h-32 transition-all"
                    />
                  </div>
                )}

                {mode === GeneratorMode.EDIT && (
                  <>
                    <ImageUpload 
                        label="Imagem para Editar" 
                        image={editSourceImage} 
                        onUpload={setEditSourceImage} 
                        onRemove={() => setEditSourceImage(null)} 
                    />
                     <div className="space-y-3">
                      <label className="text-sm font-medium text-slate-300 uppercase tracking-wide">Instruções de Edição</label>
                      <textarea
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        placeholder="Ex: Adicione um filtro vintage, remova o fundo..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none resize-none h-24 transition-all"
                      />
                    </div>
                  </>
                )}

                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className={`w-full py-4 rounded-xl font-bold text-slate-900 uppercase tracking-wider shadow-lg transition-all transform active:scale-[0.98]
                    ${loading 
                      ? 'bg-slate-700 cursor-not-allowed text-slate-400' 
                      : 'bg-gradient-to-r from-gold-400 to-gold-600 hover:from-gold-300 hover:to-gold-500 shadow-gold-500/20'}`}
                >
                  {loading ? 'Processando...' : 'Gerar Imagem'}
                </button>
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="lg:col-span-7 flex flex-col">
              <div className="sticky top-24">
                <h3 className="text-xl font-serif text-white mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-gold-500 rounded-full"></span>
                  Resultado
                </h3>
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
