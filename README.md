# Avaliações PNV — App de Feedback

Aplicativo web para as **4 avaliações** do Departamento de Engenharia Naval e Oceânica
(PNV) da Poli-USP:

1. 📚 **Matérias** — avaliação das disciplinas
2. 👩‍🏫 **Professores** — avaliação dos docentes
3. 🎓 **Vida Universitária** — experiência para além da sala
4. 🏛️ **Departamento** — gestão, estrutura e comunicação

Stack: **React + Vite + TypeScript + Tailwind CSS**. Backend em **Google Apps Script + Google
Sheets** (coleta centralizada e anônima). Painel admin protegido com métricas e gráficos.

## Experiência do aluno (fluxo)

1. Abre o link → **Começar avaliação**.
2. Passa pelas 4 seções num fluxo guiado com barra de progresso.
3. Em **Matérias** e **Professores** pode avaliar **quantos itens quiser** ("+ avaliar outra"),
   sem recomeçar. Pode **pular** seções.
4. Tela de **revisão** → **um único envio** manda tudo.
5. **Anônimo**. Uma trava leve marca no navegador que já respondeu (evita duplicatas sem
   identificar a pessoa); dá para reabrir e responder de novo se quiser.

## Painel admin (oculto dos alunos)

Rota **`/admin`**, senha **`1120`**. Mostra:
- métricas **individuais por matéria e por professor** (não só geral): média de cada pergunta
  + histograma da distribuição das notas;
- **ranking** por nota geral;
- comentários abertos;
- **exportar CSV** por formulário.

> A senha fica em `ADMIN_PASSWORD` (`src/pages/Admin.tsx`) e deve ser igual à do backend
> (`Code.gs`). Veja [BACKEND.md](BACKEND.md) para publicar o Google Sheets.

## Como rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # produção → dist/
npm run preview  # servir a produção localmente
```

## Dados oficiais (já preenchidos em `src/data/forms.ts`)

- **`MATERIAS_GRUPOS`** — disciplinas PNV ativas, agrupadas (grade nova PNV1xxx / curso PNV3xxx /
  optativas). Versões substituídas por mudança de grade foram filtradas (Introdução = `PNV1120`,
  Hidrostática = `PNV1222`).
- **`PROFESSORES`** — 23 docentes do PNV (fonte: https://sites.usp.br/ppgen/orientadores/).
- **`SEMESTRES`** — de 2026/1 até 2018/1 (+ "Antes de 2018/1").

## Deploy

`npm run build` gera `dist/` estático. Já configurado para **GitHub Pages** via
`.github/workflows/deploy.yml` (deploy automático a cada push na `main`).
Defina o secret `VITE_API_URL` no repositório para ativar a coleta central (ver BACKEND.md).

## Estrutura

```
src/
  data/forms.ts     → definição dos 4 formulários + matérias/professores/semestres
  lib/storage.ts    → envio ao backend, anti-duplicação, leitura admin, CSV
  lib/session.tsx   → estado da sessão (várias avaliações → envio único)
  lib/metrics.ts    → cálculo de métricas individuais por grupo (matéria/professor)
  components/        → campo de pergunta (Likert, NPS, select agrupado, etc.)
  pages/             → Home, Flow, ThankYou, Admin
backend/apps-script/Code.gs → backend Google Apps Script (POST grava, GET admin lê)
```
