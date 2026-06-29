const ones = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen",
];
const tens = [
  "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety",
];

function numToWordsBelow1000(num) {
  let str = "";
  if (num >= 100) {
    str += ones[Math.floor(num / 100)] + " Hundred ";
    num %= 100;
  }
  if (num >= 20) {
    str += tens[Math.floor(num / 10)] + " ";
    num %= 10;
  }
  if (num > 0) {
    str += ones[num] + " ";
  }
  return str.trim();
}

// Indian numbering system: crore, lakh, thousand, hundred
export function numberToWordsINR(amount) {
  amount = Math.round((amount + Number.EPSILON) * 100) / 100;
  const isNegative = amount < 0;
  amount = Math.abs(amount);

  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);

  let num = rupees;
  let words = "";

  const crore = Math.floor(num / 10000000);
  num %= 10000000;
  const lakh = Math.floor(num / 100000);
  num %= 100000;
  const thousand = Math.floor(num / 1000);
  num %= 1000;
  const hundredPart = num;

  if (crore > 0) words += numToWordsBelow1000(crore) + " Crore ";
  if (lakh > 0) words += numToWordsBelow1000(lakh) + " Lakh ";
  if (thousand > 0) words += numToWordsBelow1000(thousand) + " Thousand ";
  if (hundredPart > 0) words += numToWordsBelow1000(hundredPart) + " ";

  words = words.trim();
  if (!words) words = "Zero";

  let result = `${words} Rupees`;
  if (paise > 0) {
    result += ` And ${numToWordsBelow1000(paise)} Paisa`;
  }
  result += " Only";

  if (isNegative) result = "Minus " + result;

  return result.toUpperCase();
}
