import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Hammer, FileText, Badge, MessageSquare, Star, MapPin } from 'lucide-react';

export const Route = createFileRoute('/btp')({
  meta: [
    { title: "BTP & Artisans - Assistant Citoyen" },
    { name: "description", content: "Profils pros, bourse sous-traitance, SIRET vérifié" },
  ],
  component: BtpComponent,
});

function BtpComponent() {
  const [siret, setSiret] = useState('');
  
  return (
    <div className="min-h-screen bg-slate-50 pb-12">
      {/* Header */}
      <div className="bg-[#D97706] text-white p-6 shadow-sm text-center">
        <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
          <Hammer /> BTP & Artisans
        </h1>
        <p className="text-sm opacity-90 mt-1">"Les bons pros, au bon moment"</p>
      </div>

      <div className="max-w-4xl mx-auto p-4 space-y-6 mt-4">
        {/* API Sirene Module */}
        <div className="bg-white border p-5 rounded-xl shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-slate-800">Vérification Instantanée Entreprise</h3>
          <div className="flex gap-2">
            <input 
              type="text" 
              placeholder="Entrer le numéro SIRET (14 chiffres)" 
              value={siret}
              onChange={(e) => setSiret(e.target.value)}
              className="flex-1 p-2 border rounded-lg text-sm bg-slate-50 focus:outline-[#D97706]"
            />
            <button className="bg-[#D97706] text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-[#B45309]">
              Vérifier
            </button>
          </div>
          <p className="text-[11px] text-slate-500">Connecté en temps réel à l'API Sirene de data.gouv.fr</p>
        </div>

        {/* Bourse de sous-traitance */}
        <div className="bg-white border p-5 rounded-xl shadow-sm space-y-3">
          <div className="flex justify-between items-center border-b pb-2">
            <h3 className="text-sm font-bold text-slate-800">Bourse sous-traitance Williamson</h3>
            <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold">12 Offres actives</span>
          </div>
          
          <div className="p-4 bg-amber-50/50 border border-amber-200 rounded-lg space-y-2">
            <div className="flex justify-between text-xs font-bold text-slate-700">
              <span>Chantier Rénovation Toiture (Eiffage/Bouygues)</span>
              <span className="text-[#D97706]">BODACC Récent</span>
            </div>
            <p className="text-xs text-slate-600">Recherche artisan couvreur certifié RGE pour lot secondaire sur Leers. Notification IA envoyée aux 10 meilleurs profils.</p>
            <div className="flex gap-2 pt-2">
              <button className="bg-white border text-xs px-3 py-1.5 rounded-md hover:bg-slate-50 font-medium">Voir le contrat généré</button>
              <button className="bg-[#D97706] text-white text-xs px-3 py-1.5 rounded-md hover:bg-[#B45309] font-medium">Postuler</button>
            </div>
          </div>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 text-center italic mt-8 max-w-md mx-auto">
        Ces informations sont fournies à titre indicatif. Vérifiez auprès des organismes officiels ou professionnels qualifiés avant toute démarche.
      </p>
    </div>
  );
}
