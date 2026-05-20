import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const privateKey = process.env.GOOGLE_PRIVATE_KEY
      ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : '';

    const serviceAccountAuth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
    
    let sheet = doc.sheetsByTitle['สังฆทาน'];
    if (!sheet) {
      sheet = await doc.addSheet({ title: 'สังฆทาน', headerValues: ['วันที่', 'รายการ', 'บริการด่วน', 'ราคารวม'] });
    } else {
      try {
        await sheet.loadHeaderRow();
      } catch (e) {
        if (e.message.includes('No values in the header row')) {
          await sheet.setHeaderRow(['วันที่', 'รายการ', 'บริการด่วน', 'ราคารวม']);
        } else {
          throw e;
        }
      }
    }

    const { items, express, total } = req.body;
    
    const itemListStr = items.map(i => `${i.name} (${i.price}฿)`).join(', ');
    const expressStr = express ? 'ใช่ (+100฿)' : 'ไม่ใช่';
    const dateStr = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });

    await sheet.addRow({
      'วันที่': dateStr,
      'รายการ': itemListStr,
      'บริการด่วน': expressStr,
      'ราคารวม': total
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error writing to Google Sheet:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
}
