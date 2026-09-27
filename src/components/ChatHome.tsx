import React, { useState, useRef, lazy, Suspense } from 'react';

const EpicerieTown = lazy(() => import('./EpicerieTown'));

export function ChatHome() {
  const [ongletActif, setOngletActif] = useState<string>('assistant');
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [texteVocal, setTexteVocal] = useState<string>('');
  const [estEnregistrement, setEstEnregistrement] = useState<boolean>(false);
  
  const [townCoins, setTownCoins] = useState<number>(2450);
  const [avatarLevel, setAvatarLevel] = useState<number>(1);
  const [quetesTerminees, setQuetesTerminees] = useState<string[]>([]);
  const [historiqueActions, setHistoriqueActions] = useState<string[]>(["Système SocialTown en ligne v1.0"]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fluxMediaRef = useRef<MediaStream | null>(null);

  const jouerSonRetro = (type: 'clic' | 'succes' | 'levelup') => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode); gainNode.connect(audioCtx.destination);
      oscillator.type = 'square';
      if (type === 'clic') {
        oscillator.frequency.setValueAtTime(440, audioCtx.currentTime);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.1);
      } else if (type === 'succes') {
        oscillator.frequency.setValueAtTime(587.33, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + 0.08);
        gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.25);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.25);
      } else if (type === 'levelup') {
        oscillator.frequency.setValueAtTime(523.25, audioCtx.currentTime);
        oscillator.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1);
        oscillator.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2);
        oscillator.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.06, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
        oscillator.start(); oscillator.stop(audioCtx.currentTime + 0.5);
      }
    } catch (e) {}
  };

  const accomplirMission = (idMission: string, label: string, recompense: number) => {
    if (quetesTerminees.includes(idMission)) return;
    jouerSonRetro('succes');
    setQuetesTerminees([...quetesTerminees, idMission]);
    setTownCoins(prev => prev + recompense);
    setHistoriqueActions(prev => [`Quête validée : ${label} (+${recompense} 🪙)`, ...prev]);
    alert(`🏆 QUÊTE ACCOMPLIE !\nVous gagnez +${recompense} TownCoins.`);
  };

  const gererCamera = async () => {
    jouerSonRetro('clic');
    if (cameraActive) {
      if (fluxMediaRef.current) fluxMediaRef.current.getTracks().forEach(track => track.stop());
      setCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        fluxMediaRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraActive(true);
      } catch (err) { alert("Erreur caméra : " + err); }
    }
  };

  const gererVocal = () => {
    jouerSonRetro('clic');
    if (estEnregistrement) { setEstEnregistrement(false); } else {
      setTexteVocal(''); setEstEnregistrement(true);
      setTimeout(() => {
        setEstEnregistrement(false);
        setTexteVocal("Commande vocale détectée : 'Je valide mon dépôt'");
        accomplirMission('jouet_troc', "Échange Seconde Vie", 150);
      }, 3000);
    }
  };

  const changerOnglet = (nomOnglet: string) => {
    jouerSonRetro('clic');
    setOngletActif(nomOnglet);
  };
  return (
    <div className="min-h-screen bg-slate-950 text-gray-100 font-mono p-4 relative overflow-hidden select-none">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%)] bg-[length:100%_4px] z-50"></div>

      <header className="max-w-7xl mx-auto border-4 border-double border-cyan-500 bg-slate-900 p-4 mb-4 flex flex-wrap items-center justify-between shadow-[0_0_15px_rgba(34,211,238,0.3)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-800 border border-cyan-400 flex items-center justify-center text-xl">👤</div>
          <div>
            <h1 className="text-md font-bold text-cyan-400 tracking-wider">TOWNER_01</h1>
            <p className="text-[10px] text-gray-400 uppercase">Niveau {avatarLevel} • Citoyen</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-yellow-400 font-bold text-sm tracking-wide">🪙 {townCoins} TownCoins</p>
          <span className="text-[10px] bg-green-950 text-green-400 border border-green-500 px-2 py-0.5 rounded font-bold">ONLINE</span>
        </div>
      </header>

      <section className="max-w-7xl mx-auto border-2 border-red-500 bg-slate-900/90 p-3 mb-4 rounded-lg">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={gererVocal} className={`py-3 border text-xs font-bold tracking-widest transition-all rounded ${estEnregistrement ? 'bg-red-600 text-white border-white animate-pulse' : 'bg-slate-950 border-red-500 text-red-400 hover:bg-red-950/30'}`}>
            {estEnregistrement ? '🛑 ÉCOUTE...' : '🎤 MANETTE VOCALE'}
          </button>
          <button onClick={gererCamera} className={`py-3 border text-xs font-bold tracking-widest transition-all rounded ${cameraActive ? 'bg-green-600 text-white border-white' : 'bg-slate-950 border-red-500 text-red-400 hover:bg-red-950/30'}`}>
            {cameraActive ? '📸 FERMER CAMERA' : '📸 OUVRIR SCANNER'}
          </button>
        </div>
        {texteVocal && <div className="mt-2 p-2 bg-slate-950 border border-cyan-500 text-cyan-400 text-xs rounded text-center">{texteVocal}</div>}
        {cameraActive && (
          <div className="mt-3 border border-green-500 rounded bg-black overflow-hidden relative max-w-xs mx-auto aspect-video">
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
          </div>
        )}
      </section>

      <nav className="max-w-7xl mx-auto flex gap-2 overflow-x-auto pb-4 mb-6 no-scrollbar">
        <button onClick={() => changerOnglet('assistant')} className={`px-4 py-2 border-2 text-xs font-bold tracking-widest transition-all ${ongletActif === 'assistant' ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 text-cyan-400 border-cyan-500/40'}`}>🤖 ASSISTANT IA</button>
        <button onClick={() => changerOnglet('epicerie')} className={`px-4 py-2 border-2 text-xs font-bold tracking-widest transition-all ${ongletActif === 'epicerie' ? 'bg-green-500 text-slate-950 border-green-400' : 'bg-slate-900 text-green-400 border-green-500/40'}`}>🛒 ÉPICERIE</button>
      </nav>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">
        <main className="lg:col-span-2 border-4 border-slate-700 bg-slate-900/80 p-6 rounded-lg min-h-[250px]">
          <Suspense fallback={<div>Chargement...</div>}>
            {ongletActif === 'assistant' && (
              <div className="border border-cyan-500/30 bg-slate-950 p-6 rounded text-center">
                <div className="text-2xl mb-2 animate-bounce">🤖</div>
                <h2 className="text-md font-bold text-cyan-400 mb-2">ASSISTANT IA INTERACTIF</h2>
                <p className="text-xs text-gray-400">Le copilote de quartier capte vos requêtes.</p>
              </div>
            )}
            {ongletActif === 'epicerie' && (
              <Suspense fallback={<div>Chargement Épicerie...</div>}>
                <EpicerieTown townCoins={townCoins} setTownCoins={setTownCoins} />
              </Suspense>
            )}
          </Suspense>
        </main>

        <aside className="border-4 border-slate-700 bg-slate-900 p-4 rounded-lg flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-3 border-b border-slate-800 pb-1 flex items-center gap-2">📜 LOGS D'INVENTAIRE</h3>
            <div className="bg-slate-950 p-3 rounded border border-slate-800 max-h-[180px] overflow-y-auto space-y-1">
              {historiqueActions.map((log, i) => (
                <p key={i} className="text-[10px] text-gray-400 font-mono border-l-2 border-cyan-500 pl-1">&gt; {log}</p>
              ))}
            </div>
          </div>
          <div className="text-[9px] text-slate-600 text-center mt-4">SOCIALTOWN MEMORY CORE SYSTEM</div>
        </aside>
      </div>
    </div>
  );
}

export default ChatHome;
