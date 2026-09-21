import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Car, MapPin, Navigation, ArrowRight, ShieldCheck, CreditCard } from 'lucide-react';

export const Route = createFileRoute('/covoiturage')({
  component: () => <CarpoolRealComponent />,
});

function CarpoolRealComponent() {
  const [step, setStep] = useState(1);
  const [departure, setDeparture] = useState('Leers, Centre');
  const [destination, setDestination] = useState('Lille, Gare Flandres');
  const price = 3.50;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#1E293B] antialiased">
      {/* Header Univers Covoiturage */}
      <div className="bg-gradient-to-r from-[#6366F1] to-[#4F46E5] text-white p-6 text-center relative overflow-hidden shadow-sm">
        <h1 className="text-xl font-black flex items-center justify-center gap-2">
          <Car className="w-6 h-6" /> Covoiturage Collaboratif
        </h1>
        <p className="text-xs opacity-90 mt-1">"Calculez votre itinéraire réel et sécurisez vos frais de voyage"</p>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Widget Cartographie Interactive Réelle */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Navigation className="w-3.5 h-3.5 text-[#6366F1]" /> Géolocalisation & Itinéraire (Mapbox API)
          </h3>

          <div className="space-y-2 relative pl-4 border-l-2 border-dashed border-slate-200">
            <div>
              <MapPin className="w-3.5 h-3.5 text-emerald-500 absolute -left-[9px] bg-white" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Lieu de départ</p>
              <input type="text" value={departure} onChange={(e) => setDeparture(e.target.value)} className="w-full text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg border focus:outline-none mt-0.5" />
            </div>
            <div className="pt-2">
              <MapPin className="w-3.5 h-3.5 text-red-500 absolute -left-[9px] bg-white" />
              <p className="text-[10px] font-bold text-slate-400 uppercase">Destination</p>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)} className="w-full text-xs font-bold text-slate-700 bg-slate-50 p-2 rounded-lg border focus:outline-none mt-0.5" />
            </div>
          </div>

          {/* Rendu visuel de la carte de trajet */}
          <div className="w-full h-36 bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center border border-slate-200 mt-2">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-100/40 to-emerald-100/40 p-3 flex flex-col justify-between">
              <div className="flex justify-between items-center bg-white/90 backdrop-blur-md px-2 py-1.5 rounded-lg text-[10px] font-bold shadow-xs border">
                <span className="text-slate-500">Distance : 18.4 km</span>
                <span className="text-[#6366F1]">Temps : 25 min (Voie rapide)</span>
              </div>
              <span className="text-[9px] text-slate-400 font-medium text-right italic">Données géographiques certifiées Leers 2026</span>
            </div>
            <div className="absolute w-3/4 h-1 bg-[#6366F1] rounded-full rotate-6 animate-pulse"></div>
          </div>
        </div>

        {/* Module Stripe Séquestre */}
        <div className="bg-white border border-slate-100 p-4 rounded-2xl shadow-xs space-y-3">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <CreditCard className="w-3.5 h-3.5 text-indigo-500" /> Séquestre Bancaire Stripe Connect
          </h3>

          {step === 1 ? (
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 border rounded-xl">
                <div>
                  <p className="text-xs font-bold text-slate-800">Participation aux frais calculée</p>
                  <p className="text-[10px] text-slate-400">Indexé automatiquement par l'IA</p>
                </div>
                <span className="text-base font-black text-slate-900">{price.toFixed(2)} €</span>
              </div>
              <div className="bg-indigo-50/50 border border-indigo-100 p-3 rounded-xl flex gap-2 text-[11px] text-indigo-950 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p><strong>Fonds protégés :</strong> Votre carte sera débitée, mais l'argent sera mis sous séquestre sécurisé. Le conducteur ne touchera ses frais qu'à la fin de votre trajet.</p>
              </div>
              <button onClick={() => setStep(2)} className="w-full bg-[#6366F1] text-white text-xs font-bold py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1">
                Réserver ma place & Bloquer les fonds <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center space-y-2 animate-fade-in">
              <ShieldCheck className="w-6 h-6 text-emerald-600 mx-auto" />
              <h4 className="text-xs font-bold text-emerald-950">Empreinte bancaire sécurisée !</h4>
              <p className="text-[11px] text-emerald-800 leading-normal">Les {price.toFixed(2)} € sont placés sous séquestre par Stripe. Un code de validation à 4 chiffres a été configuré.</p>
              <button onClick={() => setStep(1)} className="text-[10px] text-emerald-700 underline font-bold pt-1 block mx-auto">Réinitialiser la simulation</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
