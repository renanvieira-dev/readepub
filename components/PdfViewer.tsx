"use client";

import React, { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { ReadingTheme } from "@/types/reader";

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

    const dataClone = data.slice(0);
    const loadingTask = pdfjsLib.getDocument({ data: dataClone });

    loadingTask.promise
      .then((pdf) => {
        setPdfDoc(pdf);
        onPageCountChange(pdf.numPages);
      })
      .catch((err) => {
        console.error("Erro ao carregar PDF:", err);
      });

    return () => {
      loadingTask.destroy();
    };
  }, [data]);

  useEffect(() => {
    if (!pdfDoc || !canvasRef.current) return;

    let renderTask: any = null;
    let isCancelled = false;

    pdfDoc
      .getPage(currentPage)
      .then((page: any) => {
        if (isCancelled || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        if (!context) return;

        const viewport = page.getViewport({ scale: 1.5 });
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        renderTask = page.render(renderContext);
        return renderTask.promise;
      })
      .catch((err: any) => {
        if (err?.name !== "RenderingCancelledException") {
          console.error(err);
        }
      });

    return () => {
      isCancelled = true;
      if (renderTask) {
        renderTask.cancel();
      }
    };
  }, [pdfDoc, currentPage]);

  const getFilterStyle = () => {
    switch (theme) {
      case "dark":
      case "oled":
        return "invert(0.92) hue-rotate(180deg) contrast(1.1)";
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
        className="max-h-full max-w-full rounded-lg shadow-2xl transition-[filter] duration-200"
      />
    </div>
  );
}