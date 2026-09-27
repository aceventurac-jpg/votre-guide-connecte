import React, { useState } from 'react';

interface EpicerieProps {
  townCoins: number;
  setTownCoins: React.Dispatch<React.SetStateAction<number>>;
}

export function EpicerieTown({ townCoins, setTownCoins }: EpicerieProps) {
  const articlesMagasin = [
    { id: 1, nom: '🍎 Pommes Bio du Verger', prix: 30 },
    { id: 2, nom: '🥖 Baguette Tradition', prix: 15 },
    { id: 3, nom: '🧀 Fromage Artisanal', prix: 60 },
  ];

  const acheterArticle = (nom: string, prix: number) => {
    if (townCoins < prix) {
      alert("🚨 RETRAIT ÉCHOUÉ\nSolde de TownCoins insuffisant !");
      return;
    }
    setTownCoins(prev => prev - prix);
    alert(`⚡ ACHAT VALIDÉ !\n${nom} ajouté à votre inventaire.\n-${prix} 🪙 débités.`);
  };

  return (
    <div className="border border-green-500/30 bg-slate-950 p-4 rounded">
      <h2 className="text-md font-bold text-green-400 mb-2 uppercase tracking-wide">🛒 MARCHÉ LOCAL VIRTUEL</h2>
      <p className="text-xs text-gray-400 mb-4">Dépensez vos TownCoins pour soutenir les producteurs de votre rue :</p>
      
      <div className="space-y-2">
        {articlesMagasin.map(produit => (
          <div key={produit.id} className="p-3 bg-slate-900 border border-slate-800 rounded flex justify-between items-center text-xs">
            <div>
              <p className="font-bold text-gray-200">{produit.nom}</p>
              <p className="text-yellow-400 font-semibold">{produit.prix} 🪙</p>
            </div>
            <button
              onClick={() => acheterArticle(produit.nom, produit.prix)}
              className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-[10px] uppercase transition-all"
            >
              Acheter
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EpicerieTown;
