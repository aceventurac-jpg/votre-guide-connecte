import React, { useState } from 'react';
import { Home, Search, Plus, MessageSquare, User, Sparkles } from 'lucide-react';
import { filters } from './mockData';
import { FeedCard } from './FeedCard';
export function SocialHome() {
  const [filter, setFilter] = useState('all');
  const items = [{ id: 1, cat: 'covoiturage', title: 'Covoiturage Leers ➔ Lille', badge: 'Gratuit', desc: 'Reste 3 places disponibles. Trajet régulier communauté.' }, { id: 2, cat: 'btp', title: 'Recherche Couvreur certifié RGE', badge: 'Acompte Stripe', desc: 'Notification IA envoyée aux meilleurs pros locaux.' }];
  return (
    <div className='min-h-screen bg-[#F8FAFC] pb-24 text-[#1E293B]'>
      <header className='sticky top-0 bg-white border-b p-3 flex justify-between items-center shadow-xs'><span className='font-black text-xs'>SocialTown 2026</span><div className='flex gap-2'><MessageSquare className='w-4' /><User className='w-4' /></div></header>
      <div className='p-3'><input type='text' placeholder='Rechercher...' className='w-full p-2 border rounded-xl text-xs bg-white' /></div>
      <main className='p-3 space-y-3'>{items.filter(i => filter === 'all' || i.cat === filter).map(i => <FeedCard key={i.id} i={i} />)}</main>
    </div>
  );
}
