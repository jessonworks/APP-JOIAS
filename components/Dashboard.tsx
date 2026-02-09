
import React from 'react';

export const Dashboard: React.FC = () => {
  // Dados simulados para o dashboard do SaaS
  const stats = [
    { label: 'Fotos Geradas', value: '1.284', icon: '✨', color: 'bg-gold-500' },
    { label: 'Assinantes Ativos', value: '42', icon: '👥', color: 'bg-blue-500' },
    { label: 'Créditos Disponíveis', value: '94%', icon: '💳', color: 'bg-green-500' },
    { label: 'Tempo de Geração (Média)', value: '8.4s', icon: '⚡', color: 'bg-purple-500' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div>
        <h2 className="text-3xl font-serif text-white mb-2">Painel Administrativo</h2>
        <p className="text-slate-400">Visão geral da performance do seu SaaS.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl">{stat.icon}</span>
              <div className={`w-2 h-2 rounded-full ${stat.color} shadow-[0_0_8px] shadow-current`}></div>
            </div>
            <p className="text-slate-400 text-sm font-medium uppercase tracking-wider">{stat.label}</p>
            <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl">
          <h3 className="text-xl font-serif text-white mb-6">Últimas Atividades</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-800/50 rounded-xl transition-colors border-b border-slate-800 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">📸</div>
                <div>
                  <p className="text-sm font-medium text-white">Nova joia gerada</p>
                  <p className="text-xs text-slate-500">Há {i * 5 + 2} minutos atrás</p>
                </div>
                <div className="ml-auto text-xs font-bold text-gold-500">Sucesso</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl flex flex-col justify-center items-center text-center">
          <div className="w-20 h-20 bg-gold-500/10 rounded-full flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gold-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <h3 className="text-xl font-serif text-white mb-2">Crescimento Mensal</h3>
          <p className="text-slate-400 text-sm">Sua taxa de conversão aumentou 12% em relação ao mês anterior.</p>
          <button className="mt-6 px-6 py-2 border border-gold-500/30 text-gold-500 rounded-lg hover:bg-gold-500 hover:text-slate-950 transition-all font-bold">Ver Relatório Completo</button>
        </div>
      </div>
    </div>
  );
};
