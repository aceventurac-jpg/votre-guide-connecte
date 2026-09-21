import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Utensils, Camera, Sparkles, Flame, Clock } from 'lucide-react';

export const Route = createFileRoute('/recipes')({
  component: () => <RecipesViewComponent />,
});

function RecipesViewComponent() {
  const [hasPhoto, setHasPhoto] = useState(false);
  const [recipes, setRecipes] = useState<any[]>([]);

  const simulatePhotoFrigo = () => {
    setHasPhoto(true);
    setRecipes([
      { id: 1, title: "Gratin Malin de Restes de Pâtes", time: "15 min", difficulty: "Très Facile", cost: "Éco", steps: "Mélanger les pâtes d'hier avec un fond de crème, du fromage râpé et passer au four." },
      { id: 2, title: "Omelette Gourmande du Potager", time: "10 min", difficulty: "Débutant", cost: "Zéro Déchet", steps: "Battre 3 œufs, ajouter les restes de légumes cuits et une pincée de sel." }
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 text-[#1E293B]">
      {/* Header Univers Cuisine */}
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-6 shadow-md text-center">
        <h1 className="text-xl font-black flex items-center justify-center gap-2">
          <Utensils className="w-5 h-5" /> Recettes Anti-Gaspillage
        </h1>
        <p className="text-xs opacity-90 mt-1">"Photographiez votre frigo, l'IA cuisine !"</p>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* Zone de scan Frigo */}
        {!hasPhoto ? (
          <div className="bg-white border border-dashed border-orange-200 p-6 rounded-2xl text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto">
              <Camera className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xs font-bold text-slate-800">Photographiez vos ingrédients</h3>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">Prenez une photo de vos restes. Notre IA va automatiquement lister vos ingrédients.</p>
            </div>
            <button 
              type="button"
              onClick={simulatePhotoFrigo}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-md"
            >
              Simuler la photo du Frigo 📸
            </button>
          </div>
        ) : (
          <div className="bg-orange-50/50 border border-orange-200 p-3 rounded-xl flex gap-2 text-[11px] text-orange-950">
            <Sparkles className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
            <p><strong>Analyse Vision IA Réussie :</strong> Restes détectés ! Voici vos idées de recettes simples et économiques :</p>
          </div>
        )}

        {/* Liste des recettes générées */}
        <div className="space-y-3.5">
          {recipes.map(recipe => (
            <div key={recipe.id} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-xs space-y-2.5">
              <div className="flex justify-between items-start">
                <h4 className="text-xs font-extrabold text-slate-900">{recipe.title}</h4>
                <span className="text-[9px] font-bold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md border">{recipe.cost}</span>
              </div>
              
              <div className="flex gap-3 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {recipe.time}</span>
                <span className="flex items-center gap-1"><Flame className="w-3 h-3" /> {recipe.difficulty}</span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-2.5 rounded-xl border">
                <strong>Préparation :</strong> {recipe.steps}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
