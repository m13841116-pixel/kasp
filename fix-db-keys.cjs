const fs = require('fs');

let content = fs.readFileSync('src/server/db.ts', 'utf-8');

const mapping = `
const keyMap: Record<string, string> = {
  userid: 'userId',
  isactive: 'isActive',
  deliverytime: 'deliveryTime',
  ratenum: 'rateNum',
  completedprojects: 'completedProjects',
  username: 'userName',
  contactinfo: 'contactInfo',
  aianalysis: 'aiAnalysis',
  bankname: 'bankName',
  cardnumber: 'cardNumber',
  accountholder: 'accountHolder',
  isonlinegatewayactive: 'isOnlineGatewayActive',
  customername: 'customerName',
  trackingcode: 'trackingCode',
  sendername: 'senderName',
  receiptimage: 'receiptImage',
  discountpercent: 'discountPercent',
  isused: 'isUsed',
  usedby: 'usedBy',
  createdat: 'createdAt',
  maxspins: 'maxSpins',
  prizesconfig: 'prizesConfig',
  apikey: 'apiKey'
};

function mapKeys(row: any) {
  if (!row) return row;
  const newRow: any = {};
  for (const key in row) {
    const mapped = keyMap[key] || key;
    newRow[mapped] = row[key];
  }
  return newRow;
}
`;

content = content.replace("export async function queryAll", mapping + "\nexport async function queryAll");

content = content.replace(/return res\.rows;/g, "return res.rows.map(mapKeys);");
content = content.replace(/return res\.rows\[0\] \|\| null;/g, "return res.rows.length ? mapKeys(res.rows[0]) : null;");

fs.writeFileSync('src/server/db.ts', content);
