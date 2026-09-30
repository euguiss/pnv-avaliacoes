# Avaliações PNV — App de Feedback

Aplicativo web para as **4 avaliações** do Departamento de Engenharia Naval e Oceânica
(PNV) da Poli-USP, para postar o link nos grupos:

1. 📚 **Matérias** — avaliação das disciplinas
2. 👩‍🏫 **Professores** — avaliação dos docentes
3. 🎓 **Vida Universitária** — experiência para além da sala
4. 🏛️ **Departamento** — gestão, estrutura e comunicação

Stack: **React + Vite + TypeScript + Tailwind CSS**. Sem backend — as respostas são
salvas no `localStorage` do navegador e podem ser **exportadas em CSV** no painel de resultados.

## Como rodar

```bash
npm install
npm run dev      # ambiente de desenvolvimento
npm run build    # gera a versão de produção em dist/
npm run preview  # serve a versão de produção localmente
```

## ⚠️ Antes de publicar: preencha os dados oficiais

As listas em `src/data/forms.ts` já vêm preenchidas com dados oficiais:

- **`MATERIAS_GRUPOS`** — disciplinas PNV ativas, agrupadas em "grade nova (PNV1xxx)",
  "disciplinas do curso (PNV3xxx)" e "optativas/tópicos". As versões substituídas por
  mudança de grade foram filtradas (mantida a vigente — ex.: Introdução é `PNV1120`,
  Hidrostática e Estabilidade é `PNV1222`). Atualize quando a grade mudar.
- **`PROFESSORES`** — 23 docentes/orientadores do PNV
  (fonte: https://sites.usp.br/ppgen/orientadores/) + chefia atual.
- **`SEMESTRES`** — ajuste os períodos disponíveis conforme o momento da coleta.

## Como funciona a coleta de respostas

Como não há servidor, cada resposta fica no navegador de quem responde. Duas opções:

- **Uso local / evento presencial:** todos respondem no mesmo dispositivo/quiosque;
  depois você exporta o CSV em `/resultados`.
- **Coleta distribuída (recomendado para grupos):** para reunir respostas de todos em um
  só lugar, conecte a um backend simples (ex.: um Google Apps Script, Supabase ou Firebase)
  no `saveSubmission` de `src/lib/storage.ts`. A estrutura já está isolada nesse arquivo.

## Deploy (link para os grupos)

`npm run build` gera a pasta `dist/` estática. Publique em qualquer host grátis:
Vercel, Netlify, GitHub Pages ou Cloudflare Pages. Copie o link resultante e poste no grupo.

## Estrutura

```
src/
  data/forms.ts        → definição dos 4 formulários + listas de matérias/professores
  lib/storage.ts       → persistência (localStorage) e exportação CSV
  components/           → campo de pergunta (Likert, NPS, select, etc.)
  pages/               → Home, FormPage, Results
```
