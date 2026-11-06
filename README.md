<div align="center">

# 📚 ReadEpub

### *Leitor moderno, veloz e minimalista de e-books EPUB diretamente no navegador, focado em conforto visual e leitura sem distrações.*

<br/>

<!-- Typing SVG Dinâmico -->
<a href="https://git.io/typing-svg">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=18&duration=2800&pause=900&color=6366F1&center=true&vCenter=true&width=620&lines=Leitor+de+Livros+EPUB+Direto+no+Navegador;Next.js+(App+Router)+%E2%80%A2+React+%E2%80%A2+TypeScript+%E2%80%A2+Tailwind+CSS;Processamento+Client-Side+%E2%80%A2+Zero+Tracking+%E2%80%A2+Total+Privacidade;Progressive+Web+App+(PWA)+%E2%80%A2+Leitura+Offline" alt="Typing SVG" />
</a>

<br/><br/>

<!-- Badges de Status, Deploy e Especificações -->
<p align="center">
  <a href="https://readepub.vercel.app/" target="_blank">
    <img src="https://img.shields.io/badge/Acessar_App-Online-6366F1?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Demo Vercel" />
  </a>
  <a href="https://github.com/renanvieira-dev/readepub" target="_blank">
    <img src="https://img.shields.io/badge/C%C3%B3digo_Fonte-GitHub-0F172A?style=for-the-badge&logo=github&logoColor=white" alt="Repositório GitHub" />
  </a>
  <img src="https://img.shields.io/badge/PWA-Instal%C3%A1vel-38BDF8?style=for-the-badge" alt="PWA Ready" />
  <img src="https://img.shields.io/badge/Privacidade-100%25_Local-10B981?style=for-the-badge" alt="Local Processing" />
</p>

</div>

---

### 📖 Sobre o Projeto

O **ReadEpub** é uma aplicação web progressiva (**PWA**) criada para proporcionar uma experiência fluida de leitura de livros digitais no formato `.epub`, sem a necessidade de softwares pesados, logins obrigatórios ou ecossistemas fechados.

Grande parte dos leitores de e-books tradicionais para desktop ou mobile exigem sincronizações em nuvens proprietárias, exibem anúncios ou possuem interfaces confusas. O ReadEpub segue a filosofia de **ferramenta utilitária de ponta a ponta**: o usuário seleciona ou arrasta seu arquivo EPUB e a leitura começa instantaneamente, com renderização fiel ao padrão do livro e persistência de dados no próprio dispositivo.

---

### 🧠 Decisões de Arquitetura e Engenharia

#### 1. Processamento 100% no Cliente (Privacidade & Velocidade)
* Os livros carregados pelo usuário não são enviados para servidores externos. Todo o parsing, descompressão do arquivo `.epub` e renderização de capítulos ocorrem diretamente no navegador (*client-side*).
* Zero latência de rede durante a paginação e total garantia de privacidade para a biblioteca pessoal do leitor.

#### 2. Persistência Local Inteligente (IndexedDB / LocalStorage)
* O estado de leitura, a posição exata (CFI/página), as preferências de fonte e o histórico de livros abertos são salvos no armazenamento local do navegador.
* Ao reabrir a aplicação, o usuário retoma a leitura de onde parou de forma automática.

#### 3. Ergonomia de Leitura e Design Personalizável
* Suporte a múltiplos temas de cor (Dark Mode, Sépia, E-ink e Claro) para reduzir a fadiga ocular em diferentes condições de iluminação.
* Controle granular de tipografia: tamanho de texto, espaçamento entre linhas e margens dinâmicas que se adaptam perfeitamente de celulares a monitores ultrawide.

#### 4. Suporte a PWA e Leitura Offline
* Configurado com Service Workers e Web App Manifest, permitindo a instalação nativa na tela inicial do celular ou no menu de aplicativos do computador.
* Uma vez instalado, o leitor funciona sem conexão à internet.

---

### ✨ Principais Funcionalidades

- 📖 **Carregamento Instantâneo:** Suporte a arquivos `.epub` via botão de upload ou drag-and-drop.
- 📑 **Sumário Interativo (TOC):** Navegação rápida entre capítulos, prólogos e apêndices do livro.
- 🎨 **Temas de Leitura:** Alternância rápida entre Dark, Light, Sépia e modos de alto contraste.
- 🔠 **Ajuste Tipográfico:** Escalonamento do tamanho da fonte e espaçamento de leitura em tempo real.
- 📍 **Memorização de Progresso:** Salva a última página visualizada automaticamente.
- 📱 **Modo PWA Offline:** Leitura contínua em qualquer lugar, mesmo no modo avião.

---

### 🛠️ Tecnologias e Ferramentas

<div align="center">

| Camada | Tecnologia | Função no Projeto |
| :--- | :--- | :--- |
| **Framework Core** | `Next.js (App Router)` | Estrutura moderna de rotas, otimização de assets e empacotamento |
| **Biblioteca Front-End** | `React.js` | Gerenciamento de componentes reativos, estados e ciclo de vida |
| **Linguagem** | `TypeScript` | Tipagem estática rigorosa para manipulação dos nós do EPUB |
| **Estilização** | `Tailwind CSS` | Interface minimalista, classes utilitárias e paletas de leitura |
| **Armazenamento** | `IndexedDB / Web Storage` | Cache offline do conteúdo do livro e persistência de preferências |
| **PWA Engine** | `Service Workers & Manifest` | Habilitação de instalação móvel/desktop e funcionamento offline |
| **Hospedagem & CI/CD** | `Vercel` | Deploy contínuo e distribuição global em Edge Network |

<br/>

<p align="center">
  <img src="https://skillicons.dev/icons?i=nextjs,react,ts,tailwind,vite,vercel,git&perline=7&theme=dark" alt="Stack Icons" />
</p>

</div>

---

### 🚀 Como Executar o Projeto Localmente

#### Pré-requisitos
* **Node.js** (versão 18.x ou superior recomendada)
* Gerenciador de pacotes (**npm**, **pnpm** ou **yarn**)

#### Passo a Passo

1. **Clonar o Repositório:**
```bash
git clone [https://github.com/renanvieira-dev/readepub.git](https://github.com/renanvieira-dev/readepub.git)
cd readepub

```

2. **Instalar as Dependências:**
```bash
npm install
# ou
pnpm install

```


3. **Iniciar o Ambiente de Desenvolvimento:**
```bash
npm run dev
# ou
pnpm dev

```


4. **Acessar a Aplicação:**
Abra o navegador no endereço [http://localhost:3000](http://localhost:3000).
5. **Gerar Build de Produção (Opcional):**
```bash
npm run build
npm run start

```



---

### 📁 Estrutura de Pastas

```plaintext
readepub/
├── public/                 # Ícones do PWA, favicons e manifest.json
├── src/
│   ├── app/                # Rotas da aplicação (Next.js App Router)
│   ├── components/         # Componentes do leitor (Reader, SettingsBar, TableOfContents, FileUploader)
│   ├── hooks/              # Custom hooks para persistência de leitura e controle de atalhos
│   ├── lib/                # Funções de parsing de EPUB e utilitários
│   ├── types/              # Definições de tipagem TypeScript (EpubBook, Settings, Chapter)
│   └── styles/             # Folhas de estilo globais e configuração de temas
├── package.json            # Dependências e scripts de execução
├── tsconfig.json           # Configuração do TypeScript
└── README.md               # Documentação oficial do projeto

```

---

### 👤 Autor

Desenvolvido por **Renan Vieira**
