# Backend + Painel Admin — Coleta centralizada e métricas

O app usa **Google Apps Script + Google Sheets** como backend:
- Alunos enviam avaliações **anônimas** (o app junta várias matérias/professores num único envio).
- Cada avaliação vira **uma linha** na planilha (aba por formulário) → permite métricas individuais.
- O **painel admin** (`/admin`, senha `1120`) lê essas respostas e mostra gráficos por matéria,
  por professor, ranking e comentários, além de exportar CSV. Os alunos **não veem** o painel.

## Passo a passo (≈5 min)

1. Crie uma planilha nova em https://sheets.google.com
2. Menu **Extensões → Apps Script**.
3. Apague o conteúdo padrão e cole [`backend/apps-script/Code.gs`](backend/apps-script/Code.gs).
   - A senha do admin está na constante `ADMIN_PASSWORD` (padrão `1120`). **Ela precisa ser igual**
     à do frontend (`ADMIN_PASSWORD` em `src/pages/Admin.tsx`).
4. **Implantar → Nova implantação** → tipo **App da Web**:
   - *Executar como:* **Eu**
   - *Quem pode acessar:* **Qualquer pessoa**
5. Autorize e **copie a URL** que termina em `/exec`.
6. Configure o app com essa URL:
   - **No GitHub (deploy automático):** repositório → Settings → Secrets and variables → Actions →
     New repository secret → nome `VITE_API_URL`, valor = a URL `/exec`. Depois rode o workflow.
   - **Local:** crie `.env` (copie de `.env.example`) com `VITE_API_URL=...` e rode `npm run build`.

## Como os dados ficam organizados

- Uma aba por formulário: `materias`, `professores`, `vida-universitaria`, `departamento`.
- Colunas: `createdAt`, `submissionId` e uma coluna por pergunta.
- `submissionId` identifica um mesmo envio (várias avaliações da mesma pessoa) — **sem** identificar
  quem é (anônimo). Serve só para você saber que vieram juntas.

## Painel admin

- Acesse `SEU_SITE/admin` e informe a senha.
- Escolha o formulário (aba), filtre **por matéria** ou **por docente**, veja:
  - média de cada pergunta + histograma de distribuição das notas (individual, não só geral);
  - ranking por nota geral;
  - comentários abertos;
  - botão de exportar CSV daquele formulário.

## Sem backend (modo dev/local)

Se `VITE_API_URL` estiver vazio, o app guarda os envios no `localStorage` e o admin lê deles —
útil para testar localmente antes de publicar.
