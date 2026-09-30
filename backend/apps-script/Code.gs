/**
 * Backend serverless para o app "Avaliações PNV" usando Google Apps Script.
 * As respostas são gravadas em uma planilha do Google Sheets (uma aba por formulário).
 *
 * COMO PUBLICAR (5 min):
 * 1. Crie uma planilha em https://sheets.google.com
 * 2. Menu Extensões → Apps Script. Cole este arquivo (substitui o conteúdo).
 * 3. Clique em Implantar → Nova implantação → tipo "App da Web".
 *    - Executar como: Eu
 *    - Quem pode acessar: Qualquer pessoa
 * 4. Copie a URL da implantação (termina em /exec).
 * 5. No app, defina VITE_API_URL com essa URL (arquivo .env) e faça o build/deploy.
 *
 * Cada linha recebe: data/hora, id, e as respostas (uma coluna por pergunta).
 */

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheetName = data.formSlug || "respostas";
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }

    var answers = data.answers || {};
    var keys = Object.keys(answers);

    // Cria/atualiza o cabeçalho na primeira vez.
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["createdAt", "id"].concat(keys));
    }

    // Alinha a linha às colunas existentes do cabeçalho.
    var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    var row = header.map(function (col) {
      if (col === "createdAt") return data.createdAt || new Date().toISOString();
      if (col === "id") return data.id || "";
      return answers[col] !== undefined ? answers[col] : "";
    });

    // Se surgirem perguntas novas ainda não presentes no cabeçalho, adiciona colunas.
    keys.forEach(function (k) {
      if (header.indexOf(k) === -1) {
        sheet.getRange(1, sheet.getLastColumn() + 1).setValue(k);
        row.push(answers[k]);
      }
    });

    sheet.appendRow(row);

    return jsonOutput({ ok: true });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}

function doGet() {
  return jsonOutput({ ok: true, service: "Avaliações PNV backend" });
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
