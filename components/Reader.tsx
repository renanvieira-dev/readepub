"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Upload,
  AlignLeft,
  AlignJustify,
  Highlighter,
} from "lucide-react";
import { ReaderSettings, ReadingTheme, GoogleFontName, LoadedFile } from "@/types/reader";
import EpubViewer from "./EpubViewer";
import PdfViewer from "./PdfViewer";

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

export default function Reader() {
  const [currentFile, setCurrentFile] = useState<LoadedFile | null>(null);
  const [pdfPage, setPdfPage] = useState<number>(1);
  const [pdfTotalPages, setPdfTotalPages] = useState<number>(1);

  const [showControls, setShowControls] = useState<boolean>(true);
  const [showAaPanel, setShowAaPanel] = useState<boolean>(false);
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

  // Upload e deteção de ficheiro (.epub ou .pdf)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isPdf = file.name.toLowerCase().endsWith(".pdf");
    const isEpub = file.name.toLowerCase().endsWith(".epub");

    if (!isPdf && !isEpub) {
      alert("Por favor, selecione um ficheiro .epub ou .pdf");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result as ArrayBuffer;
      setCurrentFile({
        name: file.name.replace(/\.[^/.]+$/, ""),
        type: isPdf ? "pdf" : "epub",
        data: arrayBuffer,
      });
      setPdfPage(1);
    };
    reader.readAsArrayBuffer(file);
  };

  const nextPage = () => {
    if (currentFile?.type === "epub" && renditionRef.current) {
      renditionRef.current.next();
    } else if (currentFile?.type === "pdf") {
      setPdfPage((p) => Math.min(pdfTotalPages, p + 1));
    }
  };

  const prevPage = () => {
    if (currentFile?.type === "epub" && renditionRef.current) {
      renditionRef.current.prev();
    } else if (currentFile?.type === "pdf") {
      setPdfPage((p) => Math.max(1, p - 1));
    }
  };

  const activeTheme = THEME_STYLES[settings.theme];

  return (
    <div className={`relative w-screen h-screen flex flex-col justify-between overflow-hidden ${activeTheme.bg} ${activeTheme.text}`}>
      {/* Barra de Menus Superior */}
      <header
        className={`fixed top-0 inset-x-0 h-14 backdrop-blur-md bg-opacity-80 border-b border-black/5 dark:border-white/5 flex items-center justify-between px-4 z-40 transition-transform duration-300 ${
          showControls ? "translate-y-0" : "-translate-y-full"
        }`}
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 opacity-70" />
          <span className="font-semibold text-sm truncate max-w-[200px] sm:max-w-xs">
            {currentFile ? currentFile.name : "ReadEpub"}
          </span>
          {currentFile && (
            <span className="uppercase text-[10px] px-1.5 py-0.5 rounded font-mono bg-black/10 dark:bg-white/10">
              {currentFile.type}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Botão de Upload */}
          <label className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer active:scale-95" title="Abrir EPUB ou PDF">
            <Upload className="w-5 h-5 opacity-80" />
            <input type="file" accept=".epub,.pdf" className="hidden" onChange={handleFileUpload} />
          </label>

          {/* Botão Tipografia (Aa) */}
          <button
            onClick={() => setShowAaPanel((p) => !p)}
            className="px-3 py-1 text-sm font-serif font-bold border border-current rounded-lg hover:bg-black/5 dark:hover:bg-white/10 active:scale-95"
          >
            Aa
          </button>
        </div>
      </header>

      {/* Painel de Configurações Aa */}
      {showAaPanel && (
        <div className="fixed top-16 right-4 w-84 max-w-[92vw] p-5 bg-white/95 dark:bg-[#1a1a1a]/95 text-neutral-900 dark:text-neutral-100 rounded-2xl shadow-2xl border border-black/10 dark:border-white/10 z-50 backdrop-blur-lg flex flex-col gap-4 text-xs sm:text-sm">
          {/* Temas */}
          <div>
            <label className="font-semibold block mb-2 opacity-60">Fundo e Contraste</label>
            <div className="grid grid-cols-5 gap-2">
              {(Object.keys(THEME_STYLES) as ReadingTheme[]).map((thm) => (
                <button
                  key={thm}
                  onClick={() => updateSettings({ theme: thm })}
                  className={`h-8 rounded-lg border text-xs font-medium flex items-center justify-center transition-all ${
                    settings.theme === thm ? "ring-2 ring-blue-500 scale-105" : "opacity-80"
                  } ${THEME_STYLES[thm].bg} ${THEME_STYLES[thm].text}`}
                >
                  {THEME_STYLES[thm].label[0]}
                </button>
              ))}
            </div>
          </div>

          {/* Apenas para EPUB: Controlo total de tipografia */}
          {currentFile?.type === "epub" && (
            <>
              {/* Google Fonts */}
              <div>
                <label className="font-semibold block mb-2 opacity-60">Fonte (Google Fonts)</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {GOOGLE_FONTS.map((font) => (
                    <button
                      key={font}
                      onClick={() => updateSettings({ fontFamily: font })}
                      className={`py-1.5 px-2 rounded-lg border text-xs truncate ${
                        settings.fontFamily === font ? "bg-blue-600 text-white font-bold" : "bg-neutral-100 dark:bg-neutral-800"
                      }`}
                    >
                      {font}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tamanho da Fonte */}
              <div>
                <label className="font-semibold block mb-1 opacity-60">Tamanho: {settings.fontSize}px</label>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateSettings({ fontSize: Math.max(12, settings.fontSize - 2) })}
                    className="px-3 py-1 bg-neutral-200 dark:bg-neutral-800 rounded font-bold"
                  >
                    A-
                  </button>
                  <input
                    type="range"
                    min="12"
                    max="32"
                    value={settings.fontSize}
                    onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                    className="w-full accent-blue-500"
                  />
                  <button
                    onClick={() => updateSettings({ fontSize: Math.min(36, settings.fontSize + 2) })}
                    className="px-3 py-1 bg-neutral-200 dark:bg-neutral-800 rounded font-bold"
                  >
                    A+
                  </button>
                </div>
              </div>

              {/* Alinhamento */}
              <div className="flex items-center justify-between pt-2 border-t border-neutral-200 dark:border-neutral-800">
                <span className="font-semibold opacity-60">Alinhamento</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => updateSettings({ textAlign: "left" })}
                    className={`p-1.5 rounded ${settings.textAlign === "left" ? "bg-blue-600 text-white" : "hover:bg-neutral-200 dark:hover:bg-neutral-800"}`}
                  >
                    <AlignLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => updateSettings({ textAlign: "justify" })}
                    className={`p-1.5 rounded ${settings.textAlign === "justify" ? "bg-blue-600 text-white" : "hover:bg-neutral-200 dark:hover:bg-neutral-800"}`}
                  >
                    <AlignJustify className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Área de Visualização Principal */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {currentFile ? (
          <>
            {currentFile.type === "epub" ? (
              <EpubViewer
                data={currentFile.data}
                settings={settings}
                bookKey={currentFile.name}
                renditionRef={renditionRef}
                onToggleControls={() => {
                  setShowControls((p) => !p);
                  setShowAaPanel(false);
                }}
              />
            ) : (
              <PdfViewer
                data={currentFile.data}
                theme={settings.theme}
                currentPage={pdfPage}
                onPageCountChange={(total) => setPdfTotalPages(total)}
              />
            )}
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center gap-4 p-6 text-center">
            <BookOpen className="w-16 h-16 opacity-30 stroke-[1.5]" />
            <h2 className="text-xl font-medium">Nenhum livro aberto</h2>
            <p className="text-sm opacity-60 max-w-sm">
              Carregue um arquivo <strong>.epub</strong> para personalização total de fontes ou um <strong>.pdf</strong> para leitura direta.
            </p>
            <label className="mt-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium cursor-pointer hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-500/20">
              Escolher Livro
              <input type="file" accept=".epub,.pdf" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
        )}
      </main>

      {/* Barra Inferior de Navegação */}
      {currentFile && (
        <footer
          className={`fixed bottom-0 inset-x-0 h-12 backdrop-blur-md bg-opacity-80 border-t border-black/5 dark:border-white/5 flex items-center justify-between px-6 z-40 transition-transform duration-300 ${
            showControls ? "translate-y-0" : "translate-y-full"
          }`}
        >
          <button onClick={prevPage} className="p-2 hover:opacity-70 active:scale-90">
            <ChevronLeft className="w-5 h-5" />
          </button>

          {currentFile.type === "pdf" && (
            <span className="text-xs opacity-70 font-mono">
              Página {pdfPage} de {pdfTotalPages}
            </span>
          )}

          {currentFile.type === "epub" && (
            <span className="text-xs opacity-50 flex items-center gap-1">
              <Highlighter className="w-3.5 h-3.5" /> Selecione qualquer texto para marcar
            </span>
          )}

          <button onClick={nextPage} className="p-2 hover:opacity-70 active:scale-90">
            <ChevronRight className="w-5 h-5" />
          </button>
        </footer>
      )}
    </div>
  );
}