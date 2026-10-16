"use client";

import React, { useEffect, useRef, useState } from "react";
import ePub, { Book, Rendition } from "epubjs";
import { ReaderSettings, Highlight } from "@/types/reader";

interface EpubViewerProps {
  data: ArrayBuffer;
  settings: ReaderSettings;
  bookKey: string;
  onPageChange?: (current: number, total: number) => void;
  onToggleControls?: () => void;
  renditionRef?: React.MutableRefObject<Rendition | null>;
}

// Lista de fontes do Google Fonts
const GOOGLE_FONTS_URLS: Record<string, string> = {
  Literata: "https://fonts.googleapis.com/css2?family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,700;1,7..72,400&display=swap",
  Merriweather: "https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap",
  Lora: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&display=swap",
  Inter: "https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap",
  Roboto: "https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,700;1,400&display=swap",
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
  onToggleControls,
  renditionRef: externalRenditionRef,
}: EpubViewerProps) {
  const viewerRef = useRef<HTMLDivElement>(null);
  const internalRenditionRef = useRef<Rendition | null>(null);
  const bookRef = useRef<Book | null>(null);

  const [selectionRange, setSelectionRange] = useState<{ cfiRange: string; text: string } | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [highlights, setHighlights] = useState<Highlight[]>([]);

  // Carrega marcações salvas do livro atual
  useEffect(() => {
    const saved = localStorage.getItem(`highlights_${bookKey}`);
    if (saved) {
      try {
        setHighlights(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, [bookKey]);

  // Inicializa o ePub.js
  useEffect(() => {
    if (!viewerRef.current || !data) return;

    const book = ePub(data);
    bookRef.current = book;

    const rendition = book.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      flow: "paginated",
      spread: "none",
    });

    internalRenditionRef.current = rendition;
    if (externalRenditionRef) externalRenditionRef.current = rendition;

    // Injetar Folhas de Estilo das Google Fonts dentro do Iframe do Livro
    rendition.hooks.content.register((contents: any) => {
      Object.values(GOOGLE_FONTS_URLS).forEach((url) => {
        contents.addStylesheet(url);
      });

      // Detetar clique central para exibir/ocultar barras de controlo
      const doc = contents.document;
      doc.addEventListener("click", (e: MouseEvent) => {
        const { clientWidth } = doc.documentElement;
        const x = e.clientX;
        if (x > clientWidth * 0.25 && x < clientWidth * 0.75) {
          if (onToggleControls) onToggleControls();
        }
      });
    });

    // Evento de seleção de texto (para Marcação / Highlight)
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

    // Re-aplicar destaques existentes ao virar de página
    rendition.on("rendered", () => {
      const savedHighlights: Highlight[] = JSON.parse(
        localStorage.getItem(`highlights_${bookKey}`) || "[]"
      );
      savedHighlights.forEach((hl) => {
        try {
          rendition.annotations.add("highlight", hl.cfiRange, {}, undefined, "hl-style", {
            fill: hl.color,
            "fill-opacity": "0.35",
            "mix-blend-mode": "multiply",
          });
        } catch (e) {
          // Range pode não estar na página visível no momento
        }
      });
    });

    rendition.display();

    return () => {
      book.destroy();
    };
  }, [data, bookKey]);

  // Aplicar alterações visuais (Fontes, Tamanho, Cores, Alinhamento)
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
        padding: "0 10% !important",
      },
      p: {
        "font-family": `"${settings.fontFamily}", serif !important`,
        "line-height": `${settings.lineHeight} !important`,
        "margin-bottom": "1.2em !important",
      },
    });
  }, [settings]);

  // Adicionar marcador de cor
  const addHighlight = (color: string) => {
    if (!selectionRange || !internalRenditionRef.current) return;

    const newHl: Highlight = {
      id: `hl-${Date.now()}`,
      cfiRange: selectionRange.cfiRange,
      text: selectionRange.text,
      color,
      createdAt: Date.now(),
    };

    const updated = [...highlights, newHl];
    setHighlights(updated);
    localStorage.setItem(`highlights_${bookKey}`, JSON.stringify(updated));

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
      {/* Menu flutuante de cores para realce ao selecionar texto */}
      {menuPosition && selectionRange && (
        <div
          style={{ top: `${menuPosition.y}px`, left: `${menuPosition.x}px` }}
          className="fixed -translate-x-1/2 z-50 flex items-center gap-1.5 bg-neutral-900/90 backdrop-blur-md p-1.5 rounded-full shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-150"
        >
          {["#fde047", "#86efac", "#93c5fd", "#f472b6"].map((color) => (
            <button
              key={color}
              onClick={() => addHighlight(color)}
              style={{ backgroundColor: color }}
              className="w-6 h-6 rounded-full border border-black/20 hover:scale-125 transition-transform"
            />
          ))}
          <button
            onClick={() => {
              setSelectionRange(null);
              setMenuPosition(null);
            }}
            className="text-white text-xs px-2 hover:opacity-75"
          >
            ✕
          </button>
        </div>
      )}

      {/* Conteiner onde o ePub.js injeta o iframe */}
      <div ref={viewerRef} className="w-full h-full" />
    </div>
  );
}