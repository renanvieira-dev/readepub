"use client";

import React, { useState, useEffect } from "react";
import { UserProfile } from "@/types/reader";
import { calculateRank, generateInfiniteTrophies } from "@/lib/gamification";
import {
  getAllBooksFromLibrary,
  saveBookToLibrary,
  deleteBookFromLibrary,
  SavedBook,
} from "@/lib/db";
import {
  Flame,
  Trophy as TrophyIcon,
  BookOpen,
  Upload,
  LogOut,
  CheckCircle2,
  Lock,
  Play,
  Trash2,
  BookMarked,
} from "lucide-react";

interface DashboardProps {
  profile: UserProfile | null;
  onOpenBook: (book: SavedBook) => void;
  onLogout: () => void;
}

export default function GamificationDashboard({
  profile,
  onOpenBook,
  onLogout,
}: DashboardProps) {
  const [libraryBooks, setLibraryBooks] = useState<SavedBook[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "unlocked" | "locked">("all");
  const [isUploading, setIsUploading] = useState(false);

  // Carrega a lista de livros do IndexedDB
  const loadLibrary = async () => {
    try {
      const books = await getAllBooksFromLibrary();
      setLibraryBooks(books);
    } catch (e) {
      console.error("Erro ao carregar a estante:", e);
    }
  };

  useEffect(() => {
    loadLibrary();
  }, []);

  const rank = calculateRank(profile?.xp || 0);
  const trophies = generateInfiniteTrophies(rank.level, profile?.current_streak || 1);

  const filteredTrophies = trophies.filter((t) => {
    if (selectedFilter === "unlocked") return t.unlocked;
    if (selectedFilter === "locked") return !t.unlocked;
    return true;
  });

  const unlockedCount = trophies.filter((t) => t.unlocked).length;

  // Processamento de upload de novo livro (.epub ou .pdf)
  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const isEpub = file.name.toLowerCase().endsWith(".epub");

    if (!isPdf && !isEpub) {
      alert("Por favor, selecione um ficheiro .epub ou .pdf válido.");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const buffer = ev.target?.result as ArrayBuffer;
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "");
      const newBook: SavedBook = {
        id: `book_${Date.now()}_${cleanTitle.slice(0, 15)}`,
        name: cleanTitle,
        type: isPdf ? "pdf" : "epub",
        data: buffer,
        currentPage: 1,
        totalPages: 1,
        progressPercent: 0,
        updatedAt: Date.now(),
      };

      await saveBookToLibrary(newBook);
      await loadLibrary();
      setIsUploading(false);
      onOpenBook(newBook);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleDeleteBook = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (confirm("Deseja remover este livro da sua estante?")) {
      await deleteBookFromLibrary(id);
      loadLibrary();
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#1B2632] text-[#EEE9DF] flex flex-col items-center">
      <div className="w-full max-w-5xl px-4 sm:px-8 py-8 flex flex-col gap-8 pb-28">
        
        {/* Cabeçalho Superior */}
        <header className="flex items-center justify-between border-b border-[#C9C1B1]/20 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFB162]/15 border border-[#FFB162]/30 flex items-center justify-center text-[#FFB162] shadow-lg shadow-[#FFB162]/5 shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-[#EEE9DF]">ReadEpub</h1>
              <p className="text-xs text-[#C9C1B1]">
                Viajante Literário:{" "}
                <span className="text-[#EEE9DF] font-semibold">
                  {profile?.username || "Leitor"}
                </span>
              </p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center gap-2 text-xs text-[#C9C1B1] hover:text-[#EEE9DF] transition-colors bg-[#2C3B4D] border border-[#C9C1B1]/20 px-3.5 py-2 rounded-xl cursor-pointer hover:border-[#FFB162]/50 shrink-0"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair</span>
          </button>
        </header>

        {/* RANK E BARRA DE PROGRESSO INFINITA */}
        <section className="relative overflow-hidden rounded-3xl border border-[#C9C1B1]/20 bg-linear-to-b from-[#2C3B4D] to-[#1B2632] p-6 sm:p-8 shadow-xl">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-[#FFB162]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 relative z-10">
            <div className="flex items-center gap-4">
              <div className="text-4xl p-2.5 rounded-2xl bg-[#1B2632] border border-[#C9C1B1]/20 flex items-center justify-center shrink-0">
                {rank.badge}
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-[#FFB162]/20 text-[#FFB162] border border-[#FFB162]/30">
                    Nível {rank.level}
                  </span>
                  <span className="text-xs font-mono text-[#C9C1B1]">
                    {rank.totalXp} XP Total
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-[#EEE9DF] tracking-tight">
                  {rank.title}
                </h2>
              </div>
            </div>

            <p className="text-xs text-[#C9C1B1] italic max-w-xs sm:text-right">
              "{rank.desc}"
            </p>
          </div>

          <div className="flex flex-col gap-2.5 relative z-10">
            <div className="flex justify-between items-center text-xs font-mono">
              <span className="text-[#FFB162] font-bold">{rank.currentLevelXp} XP</span>
              <span className="text-[#C9C1B1]">Próximo Nível: {rank.nextLevelXp} XP</span>
            </div>

            <div className="w-full h-3.5 bg-[#1B2632] rounded-full overflow-hidden p-0.5 border border-[#C9C1B1]/20">
              <div
                style={{ width: `${Math.max(4, rank.progressPercent)}%` }}
                className="h-full rounded-full bg-linear-to-r from-[#A35139] to-[#FFB162] shadow-md shadow-[#FFB162]/30 transition-all duration-700 ease-out"
              />
            </div>

            <div className="flex justify-between items-center text-[11px] text-[#C9C1B1]">
              <span>Faltam {rank.nextLevelXp - rank.currentLevelXp} XP para o próximo rank</span>
              <span className="font-semibold text-[#FFB162]">{rank.progressPercent}%</span>
            </div>
          </div>
        </section>

        {/* CARTÕES DE HÁBITOS (STREAK & META) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-[#2C3B4D] border border-[#C9C1B1]/20 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[#C9C1B1] uppercase tracking-wider mb-1">
                Fogo Literário (Streak)
              </span>
              <div className="text-2xl font-black text-[#EEE9DF] flex items-baseline gap-1.5">
                {profile?.current_streak || 1}{" "}
                <span className="text-xs font-normal text-[#C9C1B1]">dias seguidos</span>
              </div>
              <p className="text-[10px] text-[#C9C1B1]/80 mt-1">
                Recorde: {profile?.longest_streak || 1} dias
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#A35139]/20 border border-[#A35139]/30 flex items-center justify-center text-[#FFB162] shrink-0">
              <Flame className="w-6 h-6 animate-pulse" />
            </div>
          </div>

          <div className="bg-[#2C3B4D] border border-[#C9C1B1]/20 p-5 rounded-2xl flex items-center justify-between shadow-lg">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold text-[#C9C1B1] uppercase tracking-wider mb-1">
                Meta Diária de Leitura
              </span>
              <div className="text-2xl font-black text-[#EEE9DF] flex items-baseline gap-1.5">
                {profile?.minutes_read_today || 0} / {profile?.daily_goal_minutes || 20}{" "}
                <span className="text-xs font-normal text-[#C9C1B1]">min</span>
              </div>
              <p className="text-[10px] text-[#C9C1B1]/80 mt-1">
                Garante bónus diário de XP ao completar
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#FFB162]/10 border border-[#FFB162]/20 flex items-center justify-center text-[#FFB162] shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </section>

        {/* MINHA ESTANTE DE LIVROS */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-2 sm:gap-4 w-full">
            {/* Ícone + Título + Badge de contagem protegidos contra quebra */}
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-[#FFB162]/10 border border-[#FFB162]/20 flex items-center justify-center text-[#FFB162] shrink-0">
                <BookMarked className="w-4 h-4" />
              </div>

              <div className="flex items-center gap-2 min-w-0">
                <h3 className="text-base sm:text-lg font-bold text-[#EEE9DF] whitespace-nowrap">
                  Minha Estante
                </h3>
                <span className="text-[11px] font-mono font-medium text-[#C9C1B1] bg-[#1B2632] px-2 py-0.5 rounded-full border border-[#C9C1B1]/20 whitespace-nowrap shrink-0">
                  {libraryBooks.length} {libraryBooks.length === 1 ? "livro" : "livros"}
                </span>
              </div>
            </div>

            {/* Botão de Adicionar Livro */}
            <label className="flex items-center gap-1.5 px-3 sm:px-4 py-2 bg-[#FFB162] hover:bg-[#FFB162]/90 text-[#1B2632] font-bold rounded-xl cursor-pointer active:scale-95 transition-all text-xs shadow-md shrink-0 whitespace-nowrap">
              <Upload className="w-3.5 h-3.5 shrink-0" />
              <span>{isUploading ? "A carregar..." : "Adicionar Livro"}</span>
              <input
                type="file"
                accept=".epub,.pdf"
                className="hidden"
                disabled={isUploading}
                onChange={handleFileInput}
              />
            </label>
          </div>

          {libraryBooks.length === 0 ? (
            <div className="bg-[#2C3B4D]/60 border border-dashed border-[#C9C1B1]/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-3">
              <BookOpen className="w-12 h-12 text-[#C9C1B1]/40" />
              <p className="text-sm font-semibold text-[#EEE9DF]">A sua estante ainda está vazia</p>
              <p className="text-xs text-[#C9C1B1] max-w-sm">
                Adicione ficheiros <strong>.epub</strong> ou <strong>.pdf</strong> para montar a sua biblioteca offline com o progresso guardado.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {libraryBooks.map((b) => {
                const pagesLeft = Math.max(0, b.totalPages - b.currentPage);
                return (
                  <div
                    key={b.id}
                    onClick={() => onOpenBook(b)}
                    className="group relative bg-[#2C3B4D] hover:bg-[#2C3B4D]/90 border border-[#C9C1B1]/20 hover:border-[#FFB162]/50 p-5 rounded-2xl flex flex-col justify-between gap-4 cursor-pointer transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#1B2632] border border-[#C9C1B1]/20 flex items-center justify-center text-[#FFB162]">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="uppercase text-[9px] font-bold font-mono px-2 py-0.5 rounded bg-[#1B2632] text-[#FFB162] border border-[#FFB162]/30">
                          {b.type}
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleDeleteBook(e, b.id)}
                        className="p-1.5 rounded-lg text-[#C9C1B1] hover:text-red-400 hover:bg-[#1B2632] transition-colors"
                        title="Remover livro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div>
                      <h4 className="text-sm font-bold text-[#EEE9DF] line-clamp-2 group-hover:text-[#FFB162] transition-colors">
                        {b.name}
                      </h4>
                      <p className="text-[11px] font-mono text-[#C9C1B1] mt-1">
                        Página {b.currentPage} de {b.totalPages || 1} • {b.progressPercent || 0}%
                      </p>
                      <p className="text-[10px] text-[#C9C1B1]/70">
                        {pagesLeft === 0 ? "Leitura concluída 🎉" : `Faltam ${pagesLeft} páginas`}
                      </p>
                    </div>

                    {/* Barra de Progresso do Livro */}
                    <div className="flex flex-col gap-1.5">
                      <div className="w-full h-2 bg-[#1B2632] rounded-full overflow-hidden p-0.5 border border-[#C9C1B1]/20">
                        <div
                          style={{ width: `${Math.max(3, b.progressPercent || 0)}%` }}
                          className="h-full rounded-full bg-linear-to-r from-[#A35139] to-[#FFB162]"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-[#FFB162] font-semibold pt-1">
                        <span>Continuar Leitura</span>
                        <Play className="w-3.5 h-3.5 fill-current" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* GALERIA INFINITA DE TROFÉUS */}
        <section className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrophyIcon className="w-5 h-5 text-[#FFB162]" />
              <h3 className="text-lg font-bold text-[#EEE9DF]">Galeria de Troféus</h3>
              <span className="text-xs font-mono text-[#C9C1B1]">
                ({unlockedCount}/{trophies.length} conquistados)
              </span>
            </div>

            <div className="flex gap-1.5 bg-[#1B2632] p-1 rounded-xl border border-[#C9C1B1]/20 text-xs w-fit">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === "all" ? "bg-[#FFB162] text-[#1B2632] font-bold" : "text-[#C9C1B1] hover:text-[#EEE9DF]"
                }`}
              >
                Todos
              </button>
              <button
                onClick={() => setSelectedFilter("unlocked")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === "unlocked" ? "bg-[#FFB162] text-[#1B2632] font-bold" : "text-[#C9C1B1] hover:text-[#EEE9DF]"
                }`}
              >
                Conquistados
              </button>
              <button
                onClick={() => setSelectedFilter("locked")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  selectedFilter === "locked" ? "bg-[#FFB162] text-[#1B2632] font-bold" : "text-[#C9C1B1] hover:text-[#EEE9DF]"
                }`}
              >
                Bloqueados
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {filteredTrophies.map((trophy) => (
              <div
                key={trophy.id}
                className={`relative p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 ${
                  trophy.unlocked
                    ? "bg-linear-to-b from-[#2C3B4D] to-[#1B2632] border-[#FFB162]/40 shadow-lg"
                    : "bg-[#1B2632]/60 border-[#C9C1B1]/10 opacity-30 grayscale"
                }`}
              >
                <div className="relative">
                  <span className="text-3xl">{trophy.icon}</span>
                  {!trophy.unlocked && <Lock className="w-3.5 h-3.5 text-[#C9C1B1] absolute -bottom-1 -right-1" />}
                </div>

                <div className="flex flex-col items-center">
                  <span
                    className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      trophy.tier === "Cósmico"
                        ? "bg-[#A35139]/40 text-[#FFB162] border border-[#FFB162]/30"
                        : trophy.tier === "Diamante"
                        ? "bg-[#2C3B4D] text-[#EEE9DF] border border-[#C9C1B1]/40"
                        : "bg-[#FFB162]/20 text-[#FFB162] border border-[#FFB162]/30"
                    }`}
                  >
                    {trophy.tier}
                  </span>
                  <h4 className="text-xs font-bold text-[#EEE9DF] mt-1.5">{trophy.title}</h4>
                  <p className="text-[10px] text-[#C9C1B1] mt-0.5">{trophy.reqText}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}