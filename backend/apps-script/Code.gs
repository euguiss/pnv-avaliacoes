/**
 * Backend serverless do app "Avaliações PNV" (Google Apps Script + Google Sheets).
 *
 * Faz duas coisas:
 *  - doPost: grava respostas anônimas (uma linha por avaliação individual) na planilha.
 *  - doGet : com a senha correta, devolve todas as respostas em JSON para o painel admin.
 *
 * Cada envio do app pode conter VÁRIAS avaliações (várias matérias/professores de uma vez).
 * Cada avaliação vira uma linha na aba correspondente (materias, professores, etc.),
 * de forma que o admin consegue métricas individuais por matéria/professor.
 *
 * ================== COMO PUBLICAR (≈5 min) ==================
 * 1. Crie uma planilha em https://sheets.google.com
 * 2. Extensões → Apps Script. Apague tudo e cole este arquivo.
 * 3. Ajuste ADMIN_PASSWORD abaixo se quiser (padrão: 1120).
 * 4. Implantar → Nova implantação → tipo "App da Web":
 *      - Executar como: Eu
 *      - Quem pode acessar: Qualquer pessoa
 * 5. Copie a URL que termina em /exec.
 * 6. No app: defina VITE_API_URL (secret no GitHub / .env) com essa URL. Rebuild.
 */

var ADMIN_PASSWORD = "1120";

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    // payload = { submissionId, createdAt, items: [ { formSlug, answers } , ... ] }
    var items = payload.items || [];
    var ss = SpreadsheetApp.getActiveSpreadsheet();

    items.forEach(function (item) {
      var sheetName = item.formSlug || "respostas";
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) sheet = ss.insertSheet(sheetName);

      var answers = item.answers || {};
      var keys = Object.keys(answers);

      if (sheet.getLastRow() === 0) {
        sheet.appendRow(["createdAt", "submissionId"].concat(keys));
      }

      var header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

      // Adiciona colunas para perguntas novas que ainda não estão no cabeçalho.
      keys.forEach(function (k) {
        if (header.indexOf(k) === -1) {
          sheet.getRange(1, sheet.getLastColumn() + 1).setValue(k);
        }
      });
      header = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

      var row = header.map(function (col) {
        if (col === "createdAt") return payload.createdAt || new Date().toISOString();
        if (col === "submissionId") return payload.submissionId || "";
        return answers[col] !== undefined ? answers[col] : "";
      });
      sheet.appendRow(row);
    });

    return jsonOutput({ ok: true, count: items.length });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}

/**
 * Leitura para o painel admin. Requer ?pwd=SENHA.
 * Retorna { ok, data: { materias: [...linhas...], professores: [...], ... } }
 */
function doGet(e) {
  var pwd = (e && e.parameter && e.parameter.pwd) || "";
  if (pwd !== ADMIN_PASSWORD) {
    return jsonOutput({ ok: false, error: "unauthorized" });
  }
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheets = ss.getSheets();
    var data = {};
    sheets.forEach(function (sheet) {
      var values = sheet.getDataRange().getValues();
      if (values.length < 1) {
        data[sheet.getName()] = [];
        return;
      }
      var header = values[0];
      var rows = [];
      for (var i = 1; i < values.length; i++) {
        var obj = {};
        for (var j = 0; j < header.length; j++) {
          obj[header[j]] = values[i][j];
        }
        rows.push(obj);
      }
      data[sheet.getName()] = rows;
    });
    return jsonOutput({ ok: true, data: data });
  } catch (err) {
    return jsonOutput({ ok: false, error: String(err) });
  }
}

function jsonOutput(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON
  );
}
