"use client";

import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { ReadingTheme } from "@/types/reader";

// Configura o worker do PDF.js via CDN para evitar problemas de build no Next.js
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

interface PdfViewerProps {
  data: ArrayBuffer;
  theme: ReadingTheme;
  currentPage: number;
  onPageCountChange: (total: number) => void;
}

export default function PdfViewer({
  data,
  theme,
  currentPage,
  onPageCountChange,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    if (!data) return;
    const loadingTask = pdfjsLib.getDocument({ data });
    loadingTask.promise.then((pdf) => {
      setPdfDoc(pdf);
      onPageCountChange(pdf.numPages);
    });
  }, [data]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    pdfDoc.getPage(currentPage).then((page: any) => {
      const canvas = canvasRef.current!;
      const context = canvas.getContext("2d")!;
      const viewport = page.getViewport({ scale: 1.5 });

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      const renderContext = {
        canvasContext: context,
        viewport: viewport,
      };
      page.render(renderContext);
    });
  }, [pdfDoc, currentPage]);

  // Filtros CSS para simular temas de leitura no PDF
  const getFilterStyle = () => {
    switch (theme) {
      case "dark":
      case "oled":
        return "invert(0.9) hue-rotate(180deg) contrast(1.1)";
      case "sepia":
        return "sepia(0.35) contrast(0.95)";
      case "sage":
        return "hue-rotate(30deg) brightness(0.95)";
      default:
        return "none";
    }
  };

  return (
    <div className="w-full h-full overflow-auto flex items-center justify-center p-4">
      <canvas
        ref={canvasRef}
        style={{ filter: getFilterStyle() }}
        className="max-h-full max-w-full rounded shadow-md transition-[filter] duration-200"
      />
    </div>
  );
}