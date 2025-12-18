import React, { useState, useEffect } from 'react';
import { Users, Edit2, ChevronRight, Plus, Trash2, Save, X } from 'lucide-react';
import { Sector, TeamMember } from '../types';

interface SectorSelectorProps {
    onSelectSector: (sector: Sector) => void;
}

const DEFAULT_SECTORS: Sector[] = [
    {
        id: '1',
        name: 'Service Desk, Redes e Automação',
        manager: 'Diego',
        themeFrom: 'from-blue-500',
        themeTo: 'to-cyan-500',
        members: [
            { id: 'sd-1', name: 'Chagas' },
            { id: 'sd-2', name: 'Andriano' },
            { id: 'sd-3', name: 'Adriano' },
            { id: 'sd-4', name: 'Mateus' },
            { id: 'sd-5', name: 'Andrei' },
            { id: 'sd-6', name: 'Lucas Gustavo' },
            { id: 'sd-7', name: 'Natanael' },
            { id: 'sd-8', name: 'Igor' },
            { id: 'sd-9', name: 'Gardenia Lia' },
            { id: 'sd-10', name: 'Ingrid' },
            { id: 'sd-11', name: 'João Marcelo' },
            { id: 'sd-12', name: 'Wagner' },
            { id: 'sd-13', name: 'Micael' },
            { id: 'sd-14', name: 'Anthony' },
            { id: 'sd-15', name: 'Vitória' },
            { id: 'sd-16', name: 'Membro Novo 01' },
            { id: 'sd-17', name: 'Membro Novo 02' },
        ]
    },
    {
        id: '2',
        name: 'Sistemas, Estoque e Manutenção',
        manager: 'Esdras',
        themeFrom: 'from-orange-500',
        themeTo: 'to-red-500',
        members: [
            { id: 'sys-1', name: 'Hiago' },
            { id: 'sys-2', name: 'Carlos Alberto' },
            { id: 'sys-3', name: 'Cosme' },
            { id: 'sys-4', name: 'Gustavo' },
            { id: 'sys-5', name: 'Carlos Desiderio' },
            { id: 'sys-6', name: 'Ricardo' },
            { id: 'sys-7', name: 'André' },
            { id: 'sys-8', name: 'Wesley' },
            { id: 'sys-9', name: 'João' },
        ]
    },
    {
        id: '3',
        name: 'Cibersegurança',
        manager: 'Tech Lead',
        themeFrom: 'from-emerald-500',
        themeTo: 'to-green-500',
        members: [
            { id: 'sec-1', name: 'Renato Kira' },
            { id: 'sec-2', name: 'Kauê' },
            { id: 'sec-3', name: 'Matheus' },
            { id: 'sec-4', name: 'Isaias' },
            { id: 'sec-5', name: 'Ralyne' },
        ]
    }
];

export const SectorSelector: React.FC<SectorSelectorProps> = ({ onSelectSector }) => {
    const [sectors, setSectors] = useState<Sector[]>(() => {
        const saved = localStorage.getItem('daily-sectors');
        return saved ? JSON.parse(saved) : DEFAULT_SECTORS;
    });

    const [editingSector, setEditingSector] = useState<Sector | null>(null);
    const [newMemberName, setNewMemberName] = useState('');

    useEffect(() => {
        localStorage.setItem('daily-sectors', JSON.stringify(sectors));
    }, [sectors]);

    const handleEdit = (sector: Sector, e: React.MouseEvent) => {
        e.stopPropagation();
        setEditingSector({ ...sector });
    };

    const handleSaveSector = () => {
        if (!editingSector) return;
        setSectors(sectors.map(s => s.id === editingSector.id ? editingSector : s));
        setEditingSector(null);
    };

    const addMemberToEdit = () => {
        if (!editingSector || !newMemberName.trim()) return;
        const newMember: TeamMember = {
            id: Date.now().toString(),
            name: newMemberName
        };
        setEditingSector({
            ...editingSector,
            members: [...editingSector.members, newMember]
        });
        setNewMemberName('');
    };

    const removeMemberFromEdit = (memberId: string) => {
        if (!editingSector) return;
        setEditingSector({
            ...editingSector,
            members: editingSector.members.filter(m => m.id !== memberId)
        });
    };

    const resetToDefaults = () => {
        if (window.confirm('Deseja resetar todos os setores para os nomes padrão? Isso apagará suas edições permanentes.')) {
            setSectors(DEFAULT_SECTORS);
            localStorage.removeItem('daily-sectors');
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-8 font-sans">

            <div className="max-w-5xl w-full">
                <div className="text-center mb-16 space-y-4">
                    <h1 className="text-5xl md:text-6xl font-black text-white tracking-tighter uppercase drop-shadow-2xl">
                        Daily <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-rose-500">TI&Cyber</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-bold uppercase tracking-[0.3em]">Selecione o seu setor para iniciar</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {sectors.map(sector => (
                        <div
                            key={sector.id}
                            onClick={() => onSelectSector(sector)}
                            className={`group relative bg-slate-900 rounded-[2rem] p-8 border border-white/5 hover:border-white/10 transition-all duration-500 hover:-translate-y-2 cursor-pointer overflow-hidden shadow-2xl hover:shadow-indigo-500/20`}
                        >
                            {/* Decorative Gradient Blob */}
                            <div className={`absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br ${sector.themeFrom} ${sector.themeTo} rounded-full blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity`}></div>

                            <div className="relative z-10 flex flex-col h-full">
                                <div className="flex justify-between items-start mb-6">
                                    <div className={`p-3 rounded-2xl bg-gradient-to-br ${sector.themeFrom} ${sector.themeTo} shadow-lg`}>
                                        <Users size={24} className="text-white" />
                                    </div>
                                    <button
                                        onClick={(e) => handleEdit(sector, e)}
                                        className="p-2 text-slate-500 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                </div>

                                <h3 className="text-2xl font-black text-white mb-2 leading-tight min-h-[4rem]">
                                    {sector.name}
                                </h3>

                                <div className="flex items-center gap-2 mb-8">
                                    <div className="h-0.5 w-6 bg-slate-600 rounded-full"></div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{sector.manager}</p>
                                </div>

                                <div className="mt-auto flex justify-between items-center text-sm font-medium text-slate-500 group-hover:text-white transition-colors">
                                    <span>{sector.members.length} Membros</span>
                                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <button
                        onClick={resetToDefaults}
                        className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-slate-400 transition-colors"
                    >
                        Resetar Listas para o Padrão
                    </button>
                </div>
            </div>

            {/* EDIT MODAL */}
            {editingSector && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-slate-900 w-full max-w-2xl rounded-3xl border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95">

                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-slate-950/50">
                            <h2 className="text-xl font-black text-white uppercase tracking-wider">Editar Setor</h2>
                            <button onClick={() => setEditingSector(null)} className="text-slate-500 hover:text-white"><X /></button>
                        </div>

                        <div className="p-8 overflow-y-auto custom-scrollbar space-y-6">
                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome do Setor</label>
                                <input
                                    value={editingSector.name}
                                    onChange={e => setEditingSector({ ...editingSector, name: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Gestor / Liderança</label>
                                <input
                                    value={editingSector.manager}
                                    onChange={e => setEditingSector({ ...editingSector, manager: e.target.value })}
                                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none font-bold"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Membros ({editingSector.members.length})</label>

                                <div className="flex gap-2">
                                    <input
                                        value={newMemberName}
                                        onChange={e => setNewMemberName(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && addMemberToEdit()}
                                        placeholder="Novo membro..."
                                        className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-4 py-2 text-sm text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                                    />
                                    <button onClick={addMemberToEdit} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl">
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="max-h-48 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                    {editingSector.members.map(m => (
                                        <div key={m.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded-lg border border-white/5">
                                            <span className="text-sm font-medium text-slate-300">{m.name}</span>
                                            <button onClick={() => removeMemberFromEdit(m.id)} className="text-slate-600 hover:text-rose-500 transition-colors">
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-white/10 bg-slate-950/50 flex justify-end gap-3">
                            <button onClick={() => setEditingSector(null)} className="px-6 py-3 rounded-xl text-sm font-bold text-slate-400 hover:bg-white/5">Cancelar</button>
                            <button onClick={handleSaveSector} className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold flex items-center gap-2">
                                <Save size={16} /> Salvar Alterações
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
