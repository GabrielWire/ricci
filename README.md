# RICCI - Preparatório para a Orquestra CCB (Hinário 5)

Web application interativa e *offline-first* desenvolvida para a **RICCI - Academia de Música** (Santo André/SP), voltada para alunos e candidatos que estudam para ingressar e tocar na orquestra da **Congregação Cristã no Brasil (CCB)**.

---

## 🎯 Principais Funcionalidades

- 🎻 **Seleção de Instrumento e Família**: Suporte a Cordas (Violino, Viola, Violoncelo), Madeiras (Flauta, Clarinete, Oboé, Fagote, Saxofones), Metais (Trompete, Trompa, Trombone, Bombardino, Tuba) e Teclado/Órgão.
- 🎼 **Transposição Automática de Tonalidade**: Cálculo dinâmico das armaduras de clave para instrumentos transpositores (em Dó, Si♭, Mi♭ e Fá). O filtro e a indicação visual de acidentes refletem exatamente o que o aluno lê na partitura.
- 📖 **Catálogo Completo do Hinário 5**: Todos os 480 hinos + 6 coros com metadados musicais oficiais extraídos de partituras (fórmulas de compasso, acidentes, títulos e hinos de meia-hora).
- 📊 **Classificação Pedagógica de Dificuldade**:
  - **Fácil / Médio / Difícil** categorizados tanto para a **Introdução** quanto para o **Hino Inteiro** (baseado no estudo de referência CCB de Crislaine M. Ventura).
- 📱 **Interface Minimalista e Mobile-First**: Grade responsiva de caixas de estudo compactas, permitindo visualização de dezenas de hinos na tela do celular sem rolagem excessiva.
- ⚡ **Marcação em 1 Toque**: Alterne o status de cada hino (Estudando / Aprendido) com apenas um clique.
- 🎺 **Caderno Digital de Escalas**: Biblioteca completa de escalas maiores obrigatórias, tessitura (oitavas), digitação de arpejos e orientações para o GEM.
- 💾 **Persistência Local e Backup**: Progresso salvo no localStorage do navegador, com opção de exportação/importação de arquivo JSON para backup.
- 📴 **100% Offline-First**: Sem dependência de APIs externas ou bancos de dados lentos.

---

## 🛠️ Tecnologias Utilizadas

- **[React 19](https://react.dev/)**
- **[TypeScript](https://www.typescriptlang.org/)**
- **[Vite 6](https://vitejs.dev/)**
- **[Tailwind CSS v4](https://tailwindcss.com/)**
- **[Lucide React](https://lucide.dev/)**

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- Node.js 18+ instalado

### Instalação e Execução

`ash
# Clone o repositório
git clone https://github.com/GabrielWire/ricci.git
cd ricci

# Instale as dependências
npm install

# Inicie o servidor de desenvolvimento
npm run dev

# Para acessar pelo celular na mesma rede Wi-Fi:
npm run dev -- --host
`

### Build de Produção

`ash
npm run build
`
Os arquivos otimizados serão gerados no diretório dist/.

---

## ☁️ Deploy no AWS Amplify

Este projeto está pronto para publicação no **AWS Amplify Hosting**:
- **Framework**: Web / React + Vite
- **Build Command**: 
pm run build
- **Base Directory**: dist
- Arquivo mplify.yml já incluído na raiz do projeto.

---

Feito com dedicação para a **RICCI - Academia de Música**.
