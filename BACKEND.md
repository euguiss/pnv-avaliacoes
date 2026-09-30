# Backend — Coleta centralizada das respostas

Por padrão o app funciona **100% local** (respostas no `localStorage`, export CSV).
Para reunir as respostas de **todos os grupos em um só lugar**, ative o backend
com Google Apps Script — grátis, sem servidor, escrevendo direto numa planilha.

## Passo a passo (≈5 min)

1. Crie uma planilha nova em https://sheets.google.com
2. Menu **Extensões → Apps Script**.
3. Apague o conteúdo padrão e cole o arquivo [`backend/apps-script/Code.gs`](backend/apps-script/Code.gs).
4. **Implantar → Nova implantação** → tipo **App da Web**:
   - *Executar como:* **Eu**
   - *Quem pode acessar:* **Qualquer pessoa**
5. Autorize o acesso quando solicitado e **copie a URL** que termina em `/exec`.
6. Na raiz do projeto, crie um arquivo `.env` (copie de `.env.example`) com:
   ```
   VITE_API_URL=https://script.google.com/macros/s/SEU_ID/exec
   ```
7. Rode `npm run build` e faça o deploy. Pronto — cada resposta cai numa aba da planilha
   (uma aba por formulário: `materias`, `professores`, `vida-universitaria`, `departamento`).

## Como funciona

- O app **sempre salva localmente primeiro** (offline-first). Se `VITE_API_URL` estiver
  configurado, ele também envia a resposta para o Apps Script em segundo plano.
- O envio usa `Content-Type: text/plain` para evitar preflight CORS com o Apps Script.
- A planilha vira sua base consolidada: dá para filtrar, gerar gráficos e tabelas dinâmicas.

## Alternativas

Se preferir Supabase/Firebase, basta apontar `VITE_API_URL` para um endpoint que aceite
`POST` com JSON `{ id, formSlug, createdAt, answers }`. A lógica de envio está isolada em
`src/lib/storage.ts` (função `syncSubmission`).
