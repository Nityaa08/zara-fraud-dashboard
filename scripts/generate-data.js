// Run: node scripts/generate-data.js
// Generates public/transactions.json with ~900 transactions including an embedded fraud pattern

const fs = require("fs");
const path = require("path");

function randomChoice(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max, decimals = 2) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}
function uuid() {
  return "txn_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36).slice(-4);
}

const countries = ["Brazil", "Mexico", "Colombia"];
const paymentMethods = ["credit_card", "debit_card", "pix", "bank_transfer"];
const statuses = ["approved", "declined", "chargeback", "pending"];
const categories = ["electronics", "fashion", "home", "beauty", "sports", "groceries"];
const bins = ["4111", "4532", "5425", "5500", "3782", "6011"];
const domains = ["gmail.com", "hotmail.com", "outlook.com", "yahoo.com", "proton.me"];
const merchants = ["ZARA_BR_01", "ZARA_MX_01", "ZARA_CO_01", "ZARA_BR_02", "ZARA_MX_02"];

const now = new Date("2026-02-26T12:00:00Z");
const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function generateEmail() {
  const names = ["maria", "carlos", "ana", "jose", "pedro", "lucia", "juan", "sofia", "diego", "camila"];
  const name = randomChoice(names);
  const num = randomInt(10, 999);
  return `${name}${num}@${randomChoice(domains)}`;
}

// Normal transactions: ~850
const transactions = [];

for (let i = 0; i < 850; i++) {
  const country = randomChoice(countries);
  const ts = randomDate(sevenDaysAgo, now);
  const status = Math.random() < 0.75 ? "approved" : randomChoice(["declined", "pending", "chargeback"]);
  const amount =
    status === "chargeback"
      ? randomFloat(20, 300)
      : randomFloat(5, 500);

  transactions.push({
    id: uuid(),
    timestamp: ts.toISOString(),
    amount,
    currency: "USD",
    country,
    paymentMethod: randomChoice(paymentMethods),
    status,
    customerEmail: generateEmail(),
    cardLast4: String(randomInt(1000, 9999)),
    cardBIN: randomChoice(bins),
    productCategory: randomChoice(categories),
    ipCountry: country, // normal: IP matches billing country
    merchantId: randomChoice(merchants),
  });
}

// === EMBEDDED FRAUD PATTERN ===
// 50 chargebacks from Brazil, credit_card, electronics, in a 2-hour window on Feb 24,
// high amounts ($400–$900), IP country mismatch (shows as Nigeria or Russia)
const fraudStart = new Date("2026-02-24T02:00:00Z");
const fraudEnd = new Date("2026-02-24T04:00:00Z");
const fraudIPs = ["Nigeria", "Russia", "China"];
const fraudEmails = [
  "fraudster01@proton.me", "fraudster02@proton.me", "fraudster03@proton.me",
  "xbuyer88@gmail.com", "xbuyer99@gmail.com",
];

for (let i = 0; i < 50; i++) {
  const ts = randomDate(fraudStart, fraudEnd);
  transactions.push({
    id: uuid(),
    timestamp: ts.toISOString(),
    amount: randomFloat(400, 900),
    currency: "USD",
    country: "Brazil",
    paymentMethod: "credit_card",
    status: "chargeback",
    customerEmail: randomChoice(fraudEmails),
    cardLast4: String(randomInt(7000, 7099)), // clustered card range
    cardBIN: "4111",
    productCategory: "electronics",
    ipCountry: randomChoice(fraudIPs), // MISMATCH — key fraud indicator
    merchantId: "ZARA_BR_01",
  });
}

// Shuffle
transactions.sort(() => Math.random() - 0.5);

const outPath = path.join(__dirname, "..", "public", "transactions.json");
fs.writeFileSync(outPath, JSON.stringify(transactions, null, 2));
console.log(`Generated ${transactions.length} transactions → ${outPath}`);
