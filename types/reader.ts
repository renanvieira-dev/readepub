export type ReadingTheme = "light" | "sepia" | "sage" | "dark" | "oled";

export type GoogleFontName =
  | "Literata"
  | "Merriweather"
  | "Lora"
  | "Inter"
  | "Roboto"
  | "Cinzel";

export interface Highlight {
  id: string;
  cfiRange: string;
  text: string;
  color: string;
  createdAt: number;
}

export interface ReaderSettings {
  marginHorizontal: number;
  fontSize: number;
  lineHeight: number;
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

// Interface necessária para a gamificação e para o localAuth
export interface UserProfile {
  id: string;
  email: string;
  username: string;
  xp: number;
  level: number;
  current_streak: number;
  longest_streak: number;
  daily_goal_minutes: number;
  minutes_read_today: number;
}