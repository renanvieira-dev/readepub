"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  AlignLeft,
  AlignJustify,
  ArrowLeft,
  Sparkles,
} from "lucide-react";
import { ReaderSettings, ReadingTheme, GoogleFontName } from "@/types/reader";
import { updateUserProgress, getActiveUser } from "@/lib/localAuth";
import { updateBookLocation, SavedBook } from "@/lib/db";
import EpubViewer from "./EpubViewer";
import PdfViewer from "./PdfViewer";

interface ReaderProps {
  initialBook: SavedBook;
  onBackToDashboard: () => void;
}

const GOOGLE_FONTS: GoogleFontName[] = [
  "Literata",
  "Merriweather",
  "Lora",
  "Inter",
  "Roboto",
  "Cinzel",
];

const THEME_STYLES: Record<ReadingTheme, { bg: string; text: string; label: string }> = {
  light: { bg: "bg-[#fbfbfb]", text: "text-[#1a1a1a]", label: "Claro" },
  sepia: { bg: "bg-[#f4ecd8]", text: "text-[#4b3621]", label: "Sépia" },
  sage: { bg: "bg-[#e8ede7]", text: "text-[#2d3b36]", label: "Salva" },
  dark: { bg: "bg-[#1e1e1e]", text: "text-[#d1d5db]", label: "Escuro" },
  oled: { bg: "bg-black", text: "text-[#9ca3af]", label: "OLED" },
};

export default function Reader({ initialBook, onBackToDashboard }: ReaderProps) {
  const [currentPage, setCurrentPage] = useState<number>(initialBook.currentPage || 1);
  const [totalPages, setTotalPages] = useState<number>(initialBook.totalPages || 1);
  const [progressPercent, setProgressPercent] = useState<number>(initialBook.progressPercent || 0);

  const [showControls, setShowControls] = useState<boolean>(true);
  const [showAaPanel, setShowAaPanel] = useState<boolean>(false);
  const [xpToast, setXpToast] = useState<string | null>(null);

  const renditionRef = useRef<any>(null);

  const [settings, setSettings] = useState<ReaderSettings>({
    fontSize: 18,
    lineHeight: 1.8,
    fontFamily: "Literata",
    theme: "sepia",
    maxWidth: 750,
    textAlign: "justify",
  });

  useEffect(() => {
    const saved = localStorage.getItem("readepub_settings");
    if (saved) {
      try {
        setSettings(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const updateSettings = (partial: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...partial };
      localStorage.setItem("readepub_settings", JSON.stringify(next));
      return next;
    });
  };

  const handleProgressPersist = (page: number, total: number, percent: number, location: string | number) => {
    setCurrentPage(page);
    setTotalPages(total);
    setProgressPercent(percent);

    updateBookLocation(initialBook.id, page, total, percent, location);

    const activeUser = getActiveUser();
    if (activeUser) {
      updateUserProgress(activeUser.email, initialBook.id, page, total, 15);
      setXpToast("+15 XP");
      setTimeout(() => setXpToast(null), 1500);
    }
  };

  const nextPage = () => {
    if (initialBook.type === "epub" && renditionRef.current) {
      renditionRef.current.next();
    } else if (initialBook.type === "pdf") {
      const next = Math.min(totalPages, currentPage + 1);
      const percent = Math.round((next / Math.max(1, totalPages)) * 100);
      handleProgressPersist(next, totalPages, percent, next);
    }
  };

  const prevPage = () => {
    if (initialBook.type === "epub" && renditionRef.current) {
      renditionRef.current.prev();
    } else if (initialBook.type === "pdf") {
      const prev = Math.max(1, currentPage - 1);
      const percent = Math.round((prev / Math.max(1, totalPages)) * 100);
      handleProgressPersist(prev, totalPages, percent, prev);
    }
  };

  const pagesRemaining = Math.max(0, totalPages - currentPage);
  const activeTheme = THEME_STYLES[settings.theme];

  return (
    <div className={`relative w-screen h-screen flex flex-col justify-between overflow-hidden select-none ${activeTheme.bg} ${activeTheme.text}`}>
      {xpToast && (
        <div className="fixed top-18 left-1/2 -translate-x-1/2 z-50 flex items-center gap-1.5 bg-[#FFB162] text-[#1B2632] text-xs font-black px-4 py-1.5 rounded-full shadow-2xl animate-bounce">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{xpToast}</span>
        </div>
      )}

      {/* Topo */}
      <header
        className={`fixed top-0 inset-x-0 h-14 backdrop-blur-md bg-opacity-85 border-b border-black/5 dark:border-white/10 flex items-center justify-between px-4 z-40 transition-transform duration-300 ${
          showControls ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl hover:bg-black/10 dark:hover:bg-white/10 active:scale-95 cursor-pointer"
            title="Voltar para a Estante"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Estante</span>
          </button>

          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 opacity-70" />
            <span className="font-semibold text-sm truncate max-w-[150px] sm:max-w-xs">
              {initialBook.name}
            </span>
            <span className="uppercase text-[9px] px-1.5 py-0.5 rounded font-mono font-bold bg-[#FFB162]/20 text-[#FFB162]">
              {initialBook.type}
            </span>
          </div>
        </div>

        <button
          onClick={() => setShowAaPanel((p) => !p)}
          className="px-3 py-1 text-sm font-serif font-bold border border-current rounded-lg hover:bg-black/5 dark:hover:bg-white/10 active:scale-95 cursor-pointer"
        >
          Aa
        </button>
      </header>

      {/* Menu Aa */}
      {showAaPanel && (
        <div className="fixed top-16 right-4 w-84 max-w-[92vw] p-5 bg-[#2C3B4D] text-[#EEE9DF] rounded-2xl shadow-2xl border border-[#C9C1B1]/30 z-50 backdrop-blur-xl flex flex-col gap-4 text-xs sm:text-sm">
          <div>
            <label className="font-semibold block mb-2 text-[#C9C1B1]">Tema</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(THEME_STYLES) as ReadingTheme[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => updateSettings({ theme: thm })}
                  className={`h-8 rounded-lg border text-xs font-medium flex items-center justify-center transition-all cursor-pointer ${
                    settings.theme === thm ? "ring-2 ring-[#FFB162] scale-105" : "opacity-80"
                  } ${THEME_STYLES[thm].bg} ${THEME_STYLES[thm].text}`}
                >
                  {THEME_STYLES[thm].label[0]}
                </button>
              ))}
            </div>
          </div>

          {initialBook.type === "epub" && (
            <>
              <div>
                <label className="font-semibold block mb-2 text-[#C9C1B1]">Fonte (Google)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {GOOGLE_FONTS.map((font) => (
                    <button
                      key={font}
                      onClick={() => updateSettings({ fontFamily: font })}
                      className={`py-1.5 px-2 rounded-lg border text-xs truncate cursor-pointer ${
                        settings.fontFamily === font
                          ? "bg-[#FFB162] text-[#1B2632] font-bold"
                          : "bg-[#1B2632] border-[#C9C1B1]/20 text-[#EEE9DF]"
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold block mb-1 text-[#C9C1B1]">Tamanho: {settings.fontSize}px</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })}
                    className="px-3 py-1 bg-[#1B2632] border border-[#C9C1B1]/20 rounded font-bold cursor-pointer"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                    className="w-full accent-[#FFB162]"
                  />
                  <button
                    onClick={() => updateSettings({ fontSize: Math.min(36, settings.fontSize + 2) })}
                    className="px-3 py-1 bg-[#1B2632] border border-[#C9C1B1]/20 rounded font-bold cursor-pointer"
                  >
                    A+
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-[#C9C1B1]/20">
                <span className="font-semibold text-[#C9C1B1]">Alinhamento</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateSettings({ textAlign: "left" })}
                    className={`p-1.5 rounded cursor-pointer ${settings.textAlign === "left" ? "bg-[#FFB162] text-[#1B2632]" : "bg-[#1B2632]"}`}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateSettings({ textAlign: "justify" })}
                    className={`p-1.5 rounded cursor-pointer ${settings.textAlign === "justify" ? "bg-[#FFB162] text-[#1B2632]" : "bg-[#1B2632]"}`}
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Área Central de Visualização */}
      <main className="absolute inset-0 pt-14 pb-14 overflow-hidden">
        {initialBook.type === "epub" ? (
          <EpubViewer
            data={initialBook.data}
            settings={settings}
            bookKey={initialBook.id}
            initialLocation={initialBook.lastLocation}
            renditionRef={renditionRef}
            onPageUpdate={(page, total, percent, cfi) => handleProgressPersist(page, total, percent, cfi)}
            onToggleControls={() => {
              setShowControls((p) => !p);
              setShowAaPanel(false);
            }}
          />
        ) : (
          <PdfViewer
            data={initialBook.data}
            theme={settings.theme}
            currentPage={currentPage}
            onPageCountChange={(total) => {
              setTotalPages(total);
              const percent = Math.round((currentPage / Math.max(1, total)) * 100);
              handleProgressPersist(currentPage, total, percent, currentPage);
            }}
          />
        )}
      </main>

      {/* Rodapé com Navegação */}
      <footer
        className={`fixed bottom-0 inset-x-0 h-14 backdrop-blur-md bg-opacity-85 border-t border-black/5 dark:border-white/10 flex items-center justify-between px-6 z-40 transition-transform duration-300 ${
          showControls ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <button onClick={prevPage} className="p-2 hover:opacity-70 active:scale-90 cursor-pointer" title="Anterior">
          <ChevronLeft className="w-5 h-5" />
        </button>

        <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-4 text-xs font-mono text-center">
          <span className="font-bold">
            Pág. {currentPage} de {totalPages} ({progressPercent}%)
          </span>
          <span className="text-[11px] opacity-70">
            {pagesRemaining === 0 ? "Livro concluído! 🎉" : `Faltam ${pagesRemaining} páginas`}
          </span>
        </div>

        <button onClick={nextPage} className="p-2 hover:opacity-70 active:scale-90 cursor-pointer" title="Próxima">
          <ChevronRight className="w-5 h-5" />
        </button>
      </footer>
    </div>
  );
}