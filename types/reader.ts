export type ReadingTheme = "light" | "sepia" | "sage" | "dark" | "oled";

export type GoogleFontName =
  | "Literata"
  | "Merriweather"
  | "Lora"
  | "Inter"
  | "Roboto"
  | "Cinzel"
  | "OpenDyslexic";

export interface Highlight {
  id: string;
  cfiRange: string;
  text: string;
  color: string;
  createdAt: number;
}

export interface ReaderSettings {
  fontSize: number; // 12 a 36
  lineHeight: number; // 1.2 a 2.4
  fontFamily: GoogleFontName;
  theme: ReadingTheme;
  maxWidth: number;
  textAlign: "left" | "justify";
}

export interface LoadedFile {
  name: string;
  type: "epub" | "pdf";
  data: ArrayBuffer;
}