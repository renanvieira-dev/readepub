"use client";

import React, { useEffect, useRef, useState } from "react";
import ePub, { Book as EpubBook, Rendition } from "epubjs";
import { ReaderSettings } from "@/types/reader";

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

  // Injeção de estilos dinâmica com verificação estrita para evitar erros do TypeScript
  const injectStylesIntoContents = (contents: any) => {
    if (!contents || !contents.document) return;
    const doc = contents.document as Document;

    let styleEl = doc.getElementById("readepub-dynamic-styles") as HTMLStyleElement | null;
    if (!styleEl) {
      styleEl = doc.createElement("style");
      styleEl.id = "readepub-dynamic-styles";
      if (doc.head) {
        doc.head.appendChild(styleEl);
      } else if (doc.body) {
        doc.body.appendChild(styleEl);
      }
    }

    if (!styleEl) return;

    const theme = THEME_COLORS[settings.theme];
    const margin = settings.marginHorizontal ?? 8;

    styleEl.innerHTML = `
      html, body {
        background-color: ${theme.bg} !important;
        color: ${theme.text} !important;
        font-family: "${settings.fontFamily}", serif !important;
        font-size: ${settings.fontSize}px !important;
        line-height: ${settings.lineHeight} !important;
        text-align: ${settings.textAlign} !important;
        padding-left: ${margin}% !important;
        padding-right: ${margin}% !important;
        box-sizing: border-box !important;
        -webkit-user-select: none;
        user-select: none;
      }
      p, div, span, li, a {
        font-family: "${settings.fontFamily}", serif !important;
        line-height: ${settings.lineHeight} !important;
      }
      p {
        margin-bottom: 1.2em !important;
        text-align: ${settings.textAlign} !important;
      }
    `;
  };

  useEffect(() => {
    if (!viewerRef.current || !data) return;

    viewerRef.current.innerHTML = "";
    setLoading(true);

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

    rendition.hooks.content.register((contents: any) => {
      Object.values(GOOGLE_FONTS_URLS).forEach((url) => {
        contents.addStylesheet(url);
      });

      injectStylesIntoContents(contents);

      const doc = contents.document;

      // --- SUPORTE A SWIPE / DESLIZE NO SMARTPHONE ---
      let startX = 0;
      let startY = 0;

      doc.addEventListener(
        "touchstart",
        (e: TouchEvent) => {
          if (e.touches.length === 1) {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
          }
        },
        { passive: true }
      );

      doc.addEventListener(
        "touchend",
        (e: TouchEvent) => {
          if (e.changedTouches.length === 1) {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;

            // Exige movimento horizontal predominante superior a 40px
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
              if (deltaX < 0) {
                // Arrastou para a esquerda -> Próxima página
                rendition.next();
              } else {
                // Arrastou para a direita -> Página anterior
                rendition.prev();
              }
            }
          }
        },
        { passive: true }
      );

      // Toque central para abrir/fechar barras
      doc.addEventListener("click", (e: MouseEvent) => {
        const { clientWidth } = doc.documentElement;
        if (e.clientX > clientWidth * 0.25 && e.clientX < clientWidth * 0.75) {
          if (onToggleControls) onToggleControls();
        }
      });
    });

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

    book.ready
      .then(() => {
        return book.locations.generate(1024);
      })
      .then(() => {
        const target = typeof initialLocation === "string" ? initialLocation : undefined;
        return rendition.display(target);
      })
      .then(() => {
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erro ao carregar EPUB:", err);
        rendition.display();
        setLoading(false);
      });

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

  // Atualização em tempo real quando o utilizador altera margens, entrelinhas, fonte ou tema
  useEffect(() => {
    const rendition = internalRenditionRef.current;
    if (!rendition) return;

    const theme = THEME_COLORS[settings.theme];
    const margin = settings.marginHorizontal ?? 8;

    rendition.themes.default({
      body: {
        background: `${theme.bg} !important`,
        color: `${theme.text} !important`,
        "font-family": `"${settings.fontFamily}", serif !important`,
        "font-size": `${settings.fontSize}px !important`,
        "line-height": `${settings.lineHeight} !important`,
        "text-align": `${settings.textAlign} !important`,
        "padding-left": `${margin}% !important`,
        "padding-right": `${margin}% !important`,
        "box-sizing": "border-box !important",
      },
      p: {
        "font-family": `"${settings.fontFamily}", serif !important`,
        "line-height": `${settings.lineHeight} !important`,
        "margin-bottom": "1.2em !important",
        "text-align": `${settings.textAlign} !important`,
      },
    });

    try {
      const contentsList = (rendition as any).getContents?.() || [];
      contentsList.forEach((contents: any) => {
        injectStylesIntoContents(contents);
      });
    } catch (e) {
      console.warn("Não foi possível atualizar estilos diretamente no iframe:", e);
    }
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

      <div ref={viewerRef} className="w-full h-full" />
    </div>
  );
}