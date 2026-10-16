"use client";

import React, { useEffect, useRef, useState } from "react";
import ePub, { Book as EpubBook, Rendition } from "epubjs";
import { ReaderSettings, Highlight } from "@/types/reader";

interface EpubViewerProps {
  data: ArrayBuffer;
  settings: ReaderSettings;
  bookKey: string;
  initialLocation?: string | number;
  onPageUpdate?: (currentPage: number, totalPages: number, percent: number, cfi: string) => void;
  onToggleControls?: () => void;
  renditionRef?: React.MutableRefObject<Rendition | null>;
}

const GOOGLE_FONTS_URLS: Record<string, string> = {
  Literata: "https://fonts.googleapis.com/css2?family=Literata:opsz,wght@7..72,400;7..72,700&display=swap",
  Merriweather: "https://fonts.googleapis.com/css2?family=Merriweather:wght@400;700&display=swap",
  Lora: "https://fonts.googleapis.com/css2?family=Lora:wght@400;700&display=swap",
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
  Roboto: "https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap",
  Cinzel: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&display=swap",
};

const THEME_COLORS = {
  light: { bg: "#fbfbfb", text: "#1a1a1a" },
  sepia: { bg: "#f4ecd8", text: "#4b3621" },
  sage: { bg: "#e8ede7", text: "#2d3b36" },
  dark: { bg: "#1e1e1e", text: "#d1d5db" },
  oled: { bg: "#000000", text: "#a3a3a3" },
};

export default function EpubViewer({
  data,
  settings,
  bookKey,
  initialLocation,
  onPageUpdate,
  onToggleControls,
  renditionRef: externalRenditionRef,
}: EpubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const internalRenditionRef = useRef<Rendition | null>(null);
  const bookRef = useRef<EpubBook | null>(null);

  const [selectionRange, setSelectionRange] = useState<{ cfiRange: string; text: string } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!viewerRef.current || !data) return;

    // Limpa conteúdo anterior do contêiner para evitar duplicações no React
    viewerRef.current.innerHTML = "";
    setLoading(true);

    // Clona o buffer para evitar detachment de memória
    const book = ePub(data.slice(0));
    bookRef.current = book;

    const rendition = book.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      flow: "paginated",
      spread: "none",
    });

    internalRenditionRef.current = rendition;
    if (externalRenditionRef) externalRenditionRef.current = rendition;

    // Injeta folhas de estilo do Google Fonts
    rendition.hooks.content.register((contents: any) => {
      Object.values(GOOGLE_FONTS_URLS).forEach((url) => {
        contents.addStylesheet(url);
      });

      const doc = contents.document;
      doc.addEventListener("click", (e: MouseEvent) => {
        const { clientWidth } = doc.documentElement;
        if (e.clientX > clientWidth * 0.25 && e.clientX < clientWidth * 0.75) {
          if (onToggleControls) onToggleControls();
        }
      });
    });

    // Seleção para marcação de texto (Highlights)
    rendition.on("selected", (cfiRange: string, contents: any) => {
      const selection = contents.window.getSelection();
      const text = selection ? selection.toString() : "";
      if (text.trim().length > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setMenuPosition({
          x: rect.left + rect.width / 2,
          y: Math.max(10, rect.top - 40),
        });
        setSelectionRange({ cfiRange, text });
      }
    });

    // Gera locais para calcular número real de páginas e progresso
    book.ready
      .then(() => {
        return book.locations.generate(1024); // 1024 caracteres por página virtual
      })
      .then(() => {
        // Exibe o livro a partir do local salvo ou do início
        const target = typeof initialLocation === "string" ? initialLocation : undefined;
        return rendition.display(target);
      })
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar EPUB:", err);
        rendition.display(); // fallback
        setLoading(false);
      });

    // Dispara a cada mudança de página com dados precisos
    rendition.on("relocated", (location: any) => {
      if (book.locations && onPageUpdate) {
        const cfi = location.start.cfi;
        const locs = book.locations as any;
        
        const percent = Math.round((Number(locs.percentageFromCfi(cfi)) || 0) * 100);
        const currentPage = Number(locs.locationFromCfi(cfi)) || 1;
        const totalPages = Number(locs.total || (typeof locs.length === "function" ? locs.length() : 1)) || 1;

        onPageUpdate(currentPage, totalPages, percent, cfi);
      }
    });

    return () => {
      try {
        book.destroy();
      } catch (e) {
        console.error(e);
      }
    };
  }, [data, bookKey]);

  // Aplica tipografia e temas
  useEffect(() => {
    const rendition = internalRenditionRef.current;
    if (!rendition) return;

    const theme = THEME_COLORS[settings.theme];
    rendition.themes.default({
      body: {
        background: `${theme.bg} !important`,
        color: `${theme.text} !important`,
        "font-family": `"${settings.fontFamily}", serif !important`,
        "font-size": `${settings.fontSize}px !important`,
        "line-height": `${settings.lineHeight} !important`,
        "text-align": `${settings.textAlign} !important`,
        padding: "0 8% !important",
      },
      p: {
        "font-family": `"${settings.fontFamily}", serif !important`,
        "line-height": `${settings.lineHeight} !important`,
        "margin-bottom": "1.2em !important",
      },
    });
  }, [settings]);

  const addHighlight = (color: string) => {
    if (!selectionRange || !internalRenditionRef.current) return;
    internalRenditionRef.current.annotations.add(
      "highlight",
      selectionRange.cfiRange,
      {},
      undefined,
      "hl-style",
      { fill: color, "fill-opacity": "0.35", "mix-blend-mode": "multiply" }
    );
    setSelectionRange(null);
    setMenuPosition(null);
  };

  return (
    <div className="relative w-full h-full">
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1B2632] text-[#FFB162] z-30 font-mono text-sm gap-2">
          <div className="w-8 h-8 border-2 border-[#FFB162] border-t-transparent rounded-full animate-spin" />
          <span>Diagramando páginas do EPUB...</span>
        </div>
      )}

      {menuPosition && selectionRange && (
        <div
          style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
          className="fixed -translate-x-1/2 z-50 flex items-center gap-1.5 bg-[#2C3B4D] p-1.5 rounded-full shadow-2xl border border-[#C9C1B1]/30 animate-in fade-in"
        >
          {["#fde047", "#86efac", "#93c5fd", "#f472b6"].map((color) => (
            <button
              key={color}
              onClick={() => addHighlight(color)}
              style={{ backgroundColor: color }}
              className="w-6 h-6 rounded-full border border-black/20 hover:scale-125 transition-transform cursor-pointer"
            />
          ))}
          <button
            onClick={() => {
              setSelectionRange(null);
              setMenuPosition(null);
            }}
            className="text-[#EEE9DF] text-xs px-2 hover:opacity-75 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Contêiner de renderização */}
      <div ref={viewerRef} className="w-full h-full" />
    </div>
  );
}