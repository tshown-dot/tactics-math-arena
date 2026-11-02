/**
 * ==============================================================================
 * REALM OF NUMERIA / TACTICS MATH ARENA - GOOGLE SHEETS GRADEBOOK VAULT
 * ==============================================================================
 * FERPA / Privacy Compliant: Student real names exist ONLY in this private sheet.
 * The game and Supabase database only see anonymous 4-digit PINs.
 * 
 * SETUP INSTRUCTIONS:
 * 1. Open Google Sheets (create a new sheet titled "Math Station Gradebook").
 * 2. Create two tabs:
 *    - Tab 1 named: "Roster"
 *    - Tab 2 named: "SessionLogs"
 * 3. In the "Roster" tab, set Row 1 headers:
 *    [A1: Name] | [B1: Period] | [C1: 4-Digit PIN] | [D1: Passcode] | [E1: Notes]
 * 4. In the "SessionLogs" tab, set Row 1 headers:
 *    [A1: Timestamp] | [B1: PIN] | [C1: Student Name] | [D1: Lesson] | [E1: Score] | [F1: Total] | [G1: Accuracy %] | [H1: Boss Defeated] | [I1: XP]
 * 5. In Google Sheets menu, click: Extensions ➔ Apps Script.
 * 6. Delete whatever is there, paste this entire file, and click "Save".
 * 7. Click "Deploy" ➔ "New deployment":
 *    - Select type: "Web app"
 *    - Description: "Math Station Webhook"
 *    - Execute as: "Me (your email)"
 *    - Who has access: "Anyone" (required so student Chromebooks can log without signing in)
 * 8. Copy the Web App URL (starts with https://script.google.com/macros/s/...)
 * 9. Paste this URL into `js/db.js` as `GAS_ENDPOINT_URL`.
 * ==============================================================================
 */

function doPost(e) {
  try {
    const rawData = e.postData ? e.postData.contents : null;
    if (!rawData) {
      return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'No payload' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    const payload = JSON.parse(rawData);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ensure SessionLogs sheet exists
    let logSheet = ss.getSheetByName('SessionLogs');
    if (!logSheet) {
      logSheet = ss.insertSheet('SessionLogs');
      logSheet.appendRow(['Timestamp', 'PIN', 'Student Name', 'Lesson', 'Score', 'Total', 'Accuracy %', 'Boss Defeated', 'XP Earned']);
    }

    // Lookup Student Name from Roster tab
    const rosterSheet = ss.getSheetByName('Roster');
    let studentName = 'Unregistered PIN';
    if (rosterSheet) {
      const rosterData = rosterSheet.getDataRange().getValues();
      for (let i = 1; i < rosterData.length; i++) {
        const rowPin = String(rosterData[i][2]).trim(); // Column C is PIN
        if (rowPin === String(payload.pin).trim()) {
          studentName = rosterData[i][0]; // Column A is Student Name
          break;
        }
      }
    }

    // Append session record
    logSheet.appendRow([
      new Date(),
      payload.pin || 'Unknown',
      studentName,
      payload.lessonId || 'N/A',
      payload.score !== undefined ? payload.score : 0,
      payload.total !== undefined ? payload.total : 0,
      payload.accuracy !== undefined ? `${payload.accuracy}%` : '100%',
      payload.bossDefeated ? 'YES' : 'NO',
      payload.xpEarned || 0
    ]);

    return ContentService.createTextOutput(JSON.stringify({ status: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Utility: Run this from the Apps Script editor to auto-generate unique 4-digit PINs
 * for any students in the "Roster" tab who do not have a PIN yet!
 */
function generateMissingPins() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const roster = ss.getSheetByName('Roster');
  if (!roster) {
    SpreadsheetApp.getUi().alert('Please create a tab named "Roster" first!');
    return;
  }

  const data = roster.getDataRange().getValues();
  const existingPins = new Set();

  for (let i = 1; i < data.length; i++) {
    const pin = String(data[i][2]).trim();
    if (pin) existingPins.add(pin);
  }

  let generatedCount = 0;
  for (let i = 1; i < data.length; i++) {
    const name = data[i][0];
    const currentPin = String(data[i][2]).trim();

    if (name && !currentPin) {
      let newPin;
      do {
        newPin = String(Math.floor(1000 + Math.random() * 9000));
      } while (existingPins.has(newPin));

      existingPins.add(newPin);
      roster.getRange(i + 1, 3).setValue(newPin); // Column C
      roster.getRange(i + 1, 4).setValue('star6'); // Column D default passcode
      generatedCount++;
    }
  }

  SpreadsheetApp.getUi().alert(`Generated ${generatedCount} new PINs!`);
}
