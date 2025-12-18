import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, CheckCircle2, RotateCcw, Users, ArrowLeft, Target, Home, UserX, UserCheck } from 'lucide-react';
import { TeamMember, Sector } from '../types';
import { Wheel } from './Wheel';
import confetti from 'canvas-confetti';

interface RouletteGameProps {
    sector: Sector;
    onBack: () => void;
}

export const RouletteGame: React.FC<RouletteGameProps> = ({ sector, onBack }) => {
    // Initialize members from the selected sector
    const [members, setMembers] = useState<TeamMember[]>([...sector.members]);

    // REMAINING members for the wheel
    const [remainingMembers, setRemainingMembers] = useState<TeamMember[]>([]);

    // States for Round Limiting & Absences
    const [limitMode, setLimitMode] = useState<'all' | number>('all');
    const [roundsCount, setRoundsCount] = useState(0);
    const [showSummary, setShowSummary] = useState(false);
    const [finishedSpeakers, setFinishedSpeakers] = useState<TeamMember[]>([]);
    const [absentMemberIds, setAbsentMemberIds] = useState<string[]>([]);

    const [newName, setNewName] = useState('');
    const [isSpinning, setIsSpinning] = useState(false);
    const [currentSpeaker, setCurrentSpeaker] = useState<TeamMember | null>(null);

    // -- EFFECTS --
    useEffect(() => {
        if (remainingMembers.length === 0 && !currentSpeaker && !showSummary) {
            // Filter out absent members on initial load or reset
            const activeMembers = members.filter(m => !absentMemberIds.includes(m.id));
            setRemainingMembers(activeMembers);
        }
    }, [members]);

    const addMember = () => {
        if (!newName.trim()) return;
        const member: TeamMember = {
            id: Math.random().toString(36).substr(2, 9),
            name: newName
        };

        const updated = [...members, member];
        setMembers(updated);
        setRemainingMembers([...remainingMembers, member]);

        setNewName('');
    };

    const removeMember = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setMembers(members.filter(m => m.id !== id));
        setRemainingMembers(remainingMembers.filter(m => m.id !== id));
        setAbsentMemberIds(prev => prev.filter(aid => aid !== id));
        setFinishedSpeakers(prev => prev.filter(m => m.id !== id));
    };

    const toggleAbsent = (member: TeamMember, e: React.MouseEvent) => {
        e.stopPropagation();
        const isAbsent = absentMemberIds.includes(member.id);

        if (isAbsent) {
            // Mark as Present
            setAbsentMemberIds(prev => prev.filter(id => id !== member.id));
            const isFinished = finishedSpeakers.some(fs => fs.id === member.id);
            // If they haven't spoken yet, put them back on the wheel
            if (!isFinished) {
                setRemainingMembers(prev => [...prev, member]);
            }
        } else {
            // Mark as Absent
            setAbsentMemberIds(prev => [...prev, member.id]);
            setRemainingMembers(prev => prev.filter(m => m.id !== member.id));
        }
    };

    const handleWinner = (winner: TeamMember) => {
        setCurrentSpeaker(winner);
        setFinishedSpeakers(prev => [...prev, winner]);

        // Trigger confetti
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            zIndex: 200 // Higher than modal
        });
    };

    const closePopup = () => {
        // Remove winner from remaining
        let newRemaining = remainingMembers;
        if (currentSpeaker) {
            newRemaining = remainingMembers.filter(m => m.id !== currentSpeaker.id);
            setRemainingMembers(newRemaining);
        }

        const nextRound = roundsCount + 1;
        setRoundsCount(nextRound);
        setCurrentSpeaker(null);

        // Check Finish Conditions
        const limitReached = limitMode !== 'all' && nextRound >= limitMode;
        const everyoneDone = newRemaining.length === 0;

        if (limitReached || everyoneDone) {
            setShowSummary(true);

            // Big Finish Confetti
            const duration = 3 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const random = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                // since particles fall down, start a bit higher than random
                confetti({ ...defaults, particleCount, origin: { x: random(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: random(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);
        }
    };

    const resetDaily = () => {
        // Only reset present members to the pool
        const activeMembers = members.filter(m => !absentMemberIds.includes(m.id));
        setRemainingMembers(activeMembers);
        setFinishedSpeakers([]);
        setCurrentSpeaker(null);
        setRoundsCount(0);
        setShowSummary(false);
    };

    if (showSummary) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center p-8 animate-in fade-in duration-500">
                <div className="max-w-2xl w-full text-center space-y-8">
                    <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-green-500/20 text-green-500 mb-4 ring-4 ring-green-500/10 shadow-2xl shadow-green-500/20 animate-bounce">
                        <CheckCircle2 size={64} />
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                        Daily Finalizada!
                    </h1>

                    <p className="text-slate-400 text-lg font-medium">
                        Todos os participantes definidos ({finishedSpeakers.length}) falaram.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8">
                        {finishedSpeakers.map(m => (
                            <div key={m.id} className="bg-slate-900 border border-white/5 p-3 rounded-xl flex items-center gap-3 opacity-70">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-gradient-to-br ${sector.themeFrom} ${sector.themeTo} text-white`}>
                                    {m.name.charAt(0)}
                                </div>
                                <span className="text-xs font-bold text-slate-300 truncate">{m.name}</span>
                            </div>
                        ))}
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={onBack}
                            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                        >
                            <Home size={20} /> Voltar ao Início
                        </button>
                        <button
                            onClick={resetDaily}
                            className={`bg-gradient-to-r ${sector.themeFrom} ${sector.themeTo} text-white px-8 py-4 rounded-2xl font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl`}
                        >
                            <RotateCcw size={20} /> Nova Rodada
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 flex flex-col text-slate-200 overflow-hidden font-sans selection:bg-rose-500 selection:text-white animate-in fade-in duration-700">

            {/* Background Decor */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className={`absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br ${sector.themeFrom} to-transparent blur-[120px] opacity-20`}></div>
                <div className={`absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-gradient-to-bl ${sector.themeTo} to-transparent blur-[100px] opacity-20`}></div>
            </div>

            <header className="relative z-10 px-8 py-6 flex items-center justify-between border-b border-white/5 bg-slate-900/50 backdrop-blur-md">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onBack}
                        className="p-2 -ml-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <ArrowLeft size={24} />
                    </button>

                    <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-xl shadow-lg shadow-indigo-500/20 bg-gradient-to-br ${sector.themeFrom} ${sector.themeTo}`}>
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tighter text-white uppercase flex items-center gap-1">
                                Daily <span className={`text-transparent bg-clip-text bg-gradient-to-r ${sector.themeFrom} ${sector.themeTo}`}>TI&Cyber</span>
                            </h1>
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">{sector.name}</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {new Date().toLocaleDateString('pt-BR', { weekday: 'long' })}
                        </span>
                        <span className="text-xl font-black text-white leading-none">
                            {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                    </div>
                </div>
            </header>

            <main className="relative z-10 flex-1 flex flex-col lg:flex-row h-full overflow-hidden">

                {/* LEFT: Configure & Teams */}
                <div className="w-full lg:w-[26rem] h-full border-r border-white/5 bg-slate-900/50 flex flex-col">

                    {/* LIMIT SETTING */}
                    <div className="p-6 pb-4 border-b border-white/5">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                            <Target size={14} /> Meta da Daily
                        </h2>

                        <div className="grid grid-cols-4 gap-2">
                            <button onClick={() => setLimitMode('all')} className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${limitMode === 'all' ? `bg-gradient-to-r ${sector.themeFrom} ${sector.themeTo} border-transparent text-white shadow-lg` : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700'}`}>
                                Todos
                            </button>
                            <button onClick={() => setLimitMode(1)} className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${limitMode === 1 ? `bg-gradient-to-r ${sector.themeFrom} ${sector.themeTo} border-transparent text-white shadow-lg` : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700'}`}>
                                1
                            </button>
                            <button onClick={() => setLimitMode(3)} className={`py-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${limitMode === 3 ? `bg-gradient-to-r ${sector.themeFrom} ${sector.themeTo} border-transparent text-white shadow-lg` : 'bg-slate-800 border-white/5 text-slate-400 hover:bg-slate-700'}`}>
                                3
                            </button>
                            <input
                                type="number"
                                placeholder="#"
                                className={`bg-slate-800 border-white/5 rounded-lg text-center text-xs font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 ${typeof limitMode === 'number' && ![1, 3].includes(limitMode) ? 'ring-2 ring-indigo-500' : ''}`}
                                onChange={(e) => setLimitMode(parseInt(e.target.value) || 'all')}
                            />
                        </div>
                    </div>

                    <div className="p-6 pb-2">
                        <h2 className="text-xs font-black text-slate-500 uppercase tracking-[0.15em] mb-1 flex items-center gap-2">
                            <Users size={14} /> Fila ({remainingMembers.length})
                        </h2>
                        <div className={`h-0.5 w-8 rounded-full mt-2 bg-gradient-to-r ${sector.themeFrom} ${sector.themeTo}`}></div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6 space-y-2 custom-scrollbar">
                        {members.map(member => {
                            const isAbsent = absentMemberIds.includes(member.id);
                            const isFinished = finishedSpeakers.some(fs => fs.id === member.id);
                            // isPending = not absent AND not finished
                            const isPending = !isAbsent && !isFinished;

                            // Visual State
                            let cardStyle = 'bg-slate-800 border-white/10 hover:border-indigo-500/50 hover:shadow-lg';
                            let avatarStyle = `bg-gradient-to-br ${sector.themeFrom} ${sector.themeTo}`;
                            let textStyle = 'text-slate-200';

                            if (isFinished) {
                                cardStyle = 'bg-slate-800/30 border-white/5 opacity-50 grayscale-[0.8]';
                                avatarStyle = 'bg-slate-700';
                                textStyle = 'text-slate-500 line-through decoration-slate-600';
                            } else if (isAbsent) {
                                cardStyle = 'bg-amber-900/10 border-amber-500/10 border-dashed';
                                avatarStyle = 'bg-slate-800 text-slate-600';
                                textStyle = 'text-slate-500 italic';
                            }

                            return (
                                <div
                                    key={member.id}
                                    className={`group relative p-2.5 px-4 rounded-xl border transition-all duration-300 flex items-center gap-3 ${cardStyle}`}
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner text-white ${avatarStyle}`}>
                                        {isAbsent ? <UserX size={14} /> : member.name.charAt(0)}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h4 className={`font-bold text-sm truncate ${textStyle}`}>
                                            {member.name}
                                        </h4>
                                    </div>

                                    <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                                        <button
                                            onClick={(e) => toggleAbsent(member, e)}
                                            className={`p-1.5 rounded-lg transition-colors ${isAbsent ? 'text-green-500 hover:bg-green-500/10' : 'text-amber-500 hover:bg-amber-500/10'}`}
                                            title={isAbsent ? "Marcar como Presente" : "Marcar como Ausente"}
                                        >
                                            {isAbsent ? <UserCheck size={14} /> : <UserX size={14} />}
                                        </button>
                                        <button
                                            onClick={(e) => removeMember(member.id, e)}
                                            className="p-1.5 text-slate-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all"
                                            title="Remover desta daily"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>

                                    {isFinished && (
                                        <div className="absolute top-2 right-2 text-green-500">
                                            <CheckCircle2 size={10} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Add Temp Member */}
                    <div className="p-4 border-t border-white/5 bg-slate-900/80 backdrop-blur-md">
                        <div className="space-y-2">
                            <input
                                type="text"
                                placeholder="Convidado / Extra"
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-all font-medium"
                            />
                            <button
                                onClick={addMember}
                                className="w-full py-2.5 bg-white text-slate-900 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-50 transition-colors shadow-lg active:scale-[0.98]"
                            >
                                Adicionar Diária
                            </button>
                        </div>
                    </div>
                </div>

                {/* CENTER: Wheel Area */}
                <div className="flex-1 flex flex-col items-center justify-start pt-12 lg:pt-20 relative p-10 min-h-[600px]">
                    <Wheel
                        members={remainingMembers}
                        onWinner={handleWinner}
                        isSpinning={isSpinning}
                        setIsSpinning={setIsSpinning}
                    />

                    {/* Round Counter Overlay */}
                    <div className="absolute top-6 right-6 bg-slate-800/50 backdrop-blur-md border border-white/5 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-400">
                        Rodada {roundsCount + 1} {typeof limitMode === 'number' ? `/ ${limitMode}` : ''}
                    </div>
                </div>

            </main>

            {/* WINNER POPUP MODAL */}
            {currentSpeaker && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300" onClick={closePopup}></div>

                    <div className="relative bg-slate-900 border border-white/10 w-full max-w-lg rounded-[2.5rem] p-12 text-center shadow-2xl shadow-indigo-500/20 animate-in zoom-in-95 slide-in-from-bottom-10 duration-500 flex flex-col items-center">

                        <div className="absolute -top-12 inset-x-0 flex justify-center pointer-events-none">
                            <span className="text-6xl animate-bounce">🎉</span>
                        </div>

                        <div className="mb-6">
                            <span className={`inline-block bg-gradient-to-r ${sector.themeFrom} ${sector.themeTo} text-white text-[10px] font-black px-6 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg`}>
                                É a vez de
                            </span>
                        </div>

                        <h2 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tighter drop-shadow-xl pl-1">
                            {currentSpeaker.name}
                        </h2>

                        <div className={`w-16 h-1 bg-gradient-to-r ${sector.themeFrom} ${sector.themeTo} mb-6 opacity-50`}></div>

                        <div className="mb-12"></div>

                        <button
                            onClick={closePopup}
                            className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-[0.2em] hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-2xl"
                        >
                            Continuar
                        </button>
                    </div>
                </div>
            )}

            <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }
      `}</style>
        </div>
    );
};
