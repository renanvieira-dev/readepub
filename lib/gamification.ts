// Nomenclaturas divertidas e épicas baseadas em faixas de nível
const TITLES_BY_TIER: { minLevel: number; maxLevel: number; title: string; badge: string; desc: string }[] = [
  { minLevel: 1, maxLevel: 3, title: "Traça Curiosa", badge: "🐛", desc: "Começando a roer as primeiras páginas do multiverso." },
  { minLevel: 4, maxLevel: 7, title: "Cheirador de Livro Novo", badge: "👃📚", desc: "Aquele aroma de papel e tinta fresca é o seu combustível." },
  { minLevel: 8, maxLevel: 12, title: "Devorador de Capítulos", badge: "🍕📖", desc: "Só mais um capítulo antes de dormir... e já são 3 da manhã." },
  { minLevel: 13, maxLevel: 17, title: "Alquimista das Palavras", badge: "🧪✨", desc: "Transformando parágrafos em pura dopamina mental." },
  { minLevel: 18, maxLevel: 24, title: "Mago das Páginas Perdidas", badge: "🧙‍♂️📜", desc: "Lê tão rápido que parece feitiço de manipulação temporal." },
  { minLevel: 25, maxLevel: 32, title: "Lorde do Café & da Insônia", badge: "☕🦉", desc: "Café na xícara, EPUB na tela e o mundo exterior silenciado." },
  { minLevel: 33, maxLevel: 42, title: "Guardião da Biblioteca Infinita", badge: "🏛️🗝️", desc: "Conhece mais mundos fictícios do que a própria realidade." },
  { minLevel: 43, maxLevel: 55, title: "Viajante das Linhas Cósmicas", badge: "🌌🚀", desc: "Saltando entre dimensões e galáxias a cada virar de página." },
  { minLevel: 56, maxLevel: 70, title: "Arquivista Omnisciente", badge: "🔮👁️", desc: "A biblioteca de Alexandria inteira cabe na sua memória." },
  { minLevel: 71, maxLevel: 89, title: "Titã Literário Transcendental", badge: "⚡⚔️", desc: "Sua velocidade de leitura dobra o tecido do espaço-tempo." },
  { minLevel: 90, maxLevel: 99, title: "Oráculo da Tinta Eterna", badge: "🪐📜", desc: "Você não lê histórias. As histórias ganham vida através de você." },
];

export interface RankInfo {
  level: number;
  title: string;
  badge: string;
  desc: string;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercent: number;
  totalXp: number;
}

// Cálculo de curva de XP dinâmica (progressão suave que escala infinitamente)
export function calculateRank(xp: number): RankInfo {
  // Fórmula: cada nível exige base + escalonamento progressivo
  // Nível 1: 0 a 150 XP, Nível 2: 151 a 350 XP, etc.
  let level = 1;
  let requiredForNext = 150;
  let accumulatedXp = 0;

  while (xp >= accumulatedXp + requiredForNext) {
    accumulatedXp += requiredForNext;
    level++;
    requiredForNext = Math.round(150 * Math.pow(1.15, level - 1));
  }

  const xpInCurrentLevel = xp - accumulatedXp;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / requiredForNext) * 100));

  // Seleciona título ou gera dinamicamente para níveis astronômicos (100+)
  let titleInfo = TITLES_BY_TIER.find((t) => level >= t.minLevel && level <= t.maxLevel);

  if (!titleInfo) {
    const prestige = Math.floor((level - 100) / 10) + 1;
    titleInfo = {
      minLevel: 100,
      maxLevel: 999999,
      title: `Deidade dos Multiversos de Tinta (Prestígio ${prestige})`,
      badge: "👑✨",
      desc: "Você alcançou a imortalidade nas páginas do tempo infinito.",
    };
  }

  return {
    level,
    title: titleInfo.title,
    badge: titleInfo.badge,
    desc: titleInfo.desc,
    currentLevelXp: xpInCurrentLevel,
    nextLevelXp: requiredForNext,
    progressPercent,
    totalXp: xp,
  };
}

export interface Trophy {
  id: string;
  title: string;
  category: "level" | "streak" | "pages";
  icon: string;
  unlocked: boolean;
  reqText: string;
  tier: "Bronze" | "Prata" | "Ouro" | "Diamante" | "Mítico" | "Cósmico";
}

// Troféus escaláveis infinitamente por tiers
export function generateInfiniteTrophies(userLevel: number, userStreak: number, totalPagesRead: number = 0): Trophy[] {
  const levelMilestones = [1, 5, 10, 20, 35, 50, 75, 100, 150, 200];
  const streakMilestones = [1, 3, 7, 14, 30, 60, 100, 180, 365, 500];

  const trophies: Trophy[] = [];

  // Trophies de Nível
  levelMilestones.forEach((lvl, idx) => {
    const tiers: Trophy["tier"][] = ["Bronze", "Prata", "Ouro", "Diamante", "Mítico", "Cósmico"];
    const tier = tiers[Math.min(idx, tiers.length - 1)];
    trophies.push({
      id: `lvl_${lvl}`,
      title: `Ascensão: Nível ${lvl}`,
      category: "level",
      icon: lvl >= 100 ? "👑" : lvl >= 50 ? "🌌" : lvl >= 20 ? "⚔️" : "🌱",
      unlocked: userLevel >= lvl,
      reqText: `Alcançar o Nível ${lvl}`,
      tier,
    });
  });

  // Trophies de Sequência Diária
  streakMilestones.forEach((stk, idx) => {
    trophies.push({
      id: `stk_${stk}`,
      title: stk === 365 ? "Odisseia de Um Ano" : `Fogo Contínuo: ${stk} Dias`,
      category: "streak",
      icon: stk >= 365 ? "🌟" : stk >= 30 ? "🔥" : "🕯️",
      unlocked: userStreak >= stk,
      reqText: `${stk} dias seguidos de leitura`,
      tier: stk >= 100 ? "Cósmico" : stk >= 30 ? "Diamante" : "Ouro",
    });
  });

  return trophies;
}