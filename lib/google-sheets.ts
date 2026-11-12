
import { google } from "googleapis";

const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
const privateKey = process.env.GOOGLE_PRIVATE_KEY;
const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;

if (!clientEmail || !privateKey || !spreadsheetId) {
    throw new Error(
        "Google Sheets environment variables are missing"
    );
}

const auth = new google.auth.GoogleAuth({
    credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, "\n"),
    },
    scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
    ],
});

export const sheets = google.sheets({
    version: "v4",
    auth,
});

export const GOOGLE_SPREADSHEET_ID = spreadsheetId;
