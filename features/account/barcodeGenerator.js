const LEFT_CODES = {
  '0': '0001101',
  '1': '0011001',
  '2': '0010011',
  '3': '0111101',
  '4': '0100011',
  '5': '0110001',
  '6': '0101111',
  '7': '0111011',
  '8': '0110111',
  '9': '0001011',
};

const RIGHT_CODES = {
  '0': '1110010',
  '1': '1100110',
  '2': '1101100',
  '3': '1000010',
  '4': '1011100',
  '5': '1001110',
  '6': '1010000',
  '7': '1000100',
  '8': '1001000',
  '9': '1110100',
};

const isNumeric = (s) => /^\d+$/.test(String(s ?? ''));

const hashSeed = (raw) => {
  let seed = 0;
  const str = String(raw ?? '');
  for (let i = 0; i < str.length; i += 1) {
    seed = (seed * 33 + str.charCodeAt(i)) >>> 0;
  }
  return seed >>> 0;
};

// Code 128 patterns (values 0..106). Each entry is run-lengths starting with BAR.
// Stop (106) uses 7 run lengths.
const CODE128_PATTERNS = [
  '212222','222122','222221','121223','121322','131222','122213','122312','132212','221213',
  '221312','231212','112232','122132','122231','113222','123122','123221','223211','221132',
  '221231','213212','223112','312131','311222','321122','321221','312212','322112','322211',
  '212123','212321','232121','111323','131123','131321','112313','132113','132311','211313',
  '231113','231311','112133','112331','132131','113123','113321','133121','313121','211331',
  '231131','213113','213311','213131','311123','311321','331121','312113','312311','332111',
  '314111','221411','431111','111224','111422','121124','121421','141122','141221','112214',
  '112412','122114','122411','142112','142211','241211','221114','413111','241112','134111',
  '111242','121142','121241','114212','124112','124211','411212','421112','421211','212141',
  '214121','412121','111143','111341','131141','114113','114311','411113','411311','113141',
  '114131','311141','411131','211412','211214','211232','2331112',
];

const upcCheckDigit = (digits11) => {
  // UPC-A check digit: (10 - ((3*sumOdd + sumEven) % 10)) % 10
  const d = String(digits11).replace(/\D/g, '').slice(0, 11).padEnd(11, '0');
  let sumOdd = 0;
  let sumEven = 0;
  for (let i = 0; i < 11; i += 1) {
    const n = Number(d[i]) || 0;
    if (i % 2 === 0) sumOdd += n;
    else sumEven += n;
  }
  const total = sumOdd * 3 + sumEven;
  return String((10 - (total % 10)) % 10);
};

const makeUpcA12 = (numericDigits) => {
  const d = String(numericDigits ?? '').replace(/\D/g, '');
  if (d.length >= 12) return d.slice(0, 12);
  if (d.length === 11) return d + upcCheckDigit(d);
  // for 10 or other lengths, pad to 11 then add check digit
  const padded11 = d.slice(0, 11).padEnd(11, '0');
  return padded11 + upcCheckDigit(padded11);
};

const upcPattern = (digits12) => {
  const digits = String(digits12).replace(/\D/g, '').slice(0, 12).padEnd(12, '0');
  const left = digits
    .slice(0, 6)
    .split('')
    .map((d) => LEFT_CODES[d] ?? LEFT_CODES['0'])
    .join('');
  const right = digits
    .slice(6, 12)
    .split('')
    .map((d) => RIGHT_CODES[d] ?? RIGHT_CODES['0'])
    .join('');
  return `101${left}01010${right}101`;
};

const pseudoPatternFromSeed = (seed, barCount = 64) => {
  // Deterministic "barcode-like" bits for alphanumeric / short numeric.
  let s = seed >>> 0;
  let bits = '101'; // start guard-ish
  for (let i = 0; i < barCount; i += 1) {
    s = (s * 1664525 + 1013904223) >>> 0;
    const chunk = (s & 0xff) % 14;
    // create short run lengths; avoid huge blank areas
    bits += chunk < 3 ? '111' : chunk < 8 ? '10' : '110';
    bits += '0';
  }
  bits += '101';
  return bits.replace(/00+/g, '0');
};

const encodeCode128B = (raw) => {
  // Code set B supports ASCII 32..127
  const input = String(raw ?? '').slice(0, 10); // student IDs max 10 chars
  const START_B = 104;
  const STOP = 106;
  const values = [START_B];
  for (let i = 0; i < input.length; i += 1) {
    const code = input.charCodeAt(i);
    const v = Math.min(95, Math.max(0, code - 32));
    values.push(v);
  }
  let checksum = START_B;
  for (let i = 1; i < values.length; i += 1) {
    checksum += values[i] * i;
  }
  checksum %= 103;
  values.push(checksum);
  values.push(STOP);

  // Convert run-length patterns to module bitstring.
  let bits = '';
  for (let i = 0; i < values.length; i += 1) {
    const p = CODE128_PATTERNS[values[i]] ?? CODE128_PATTERNS[0];
    let isBar = true;
    for (let j = 0; j < p.length; j += 1) {
      const run = Number(p[j]) || 1;
      bits += (isBar ? '1' : '0').repeat(run);
      isBar = !isBar;
    }
  }
  return { bits, text: input };
};

export const generateBarcodeData = (value) => {
  const raw = String(value ?? '');
  const numeric = raw.replace(/\D/g, '');

  // 4-digit numeric: keep numeric barcode + show the 4 digits (no UPC grouping)
  if (numeric.length === 4) {
    const pattern = pseudoPatternFromSeed(hashSeed(numeric), 28);
    return {
      kind: 'numeric-4',
      digits: numeric,
      pattern,
      groups: ['', numeric, '', ''],
      humanText: numeric,
    };
  }

  // 10/11/12-digit numeric: UPC-like
  if (isNumeric(numeric) && (numeric.length === 10 || numeric.length === 11 || numeric.length === 12)) {
    const digits12 = makeUpcA12(numeric);
    return {
      kind: 'upc-a',
      digits: digits12,
      pattern: upcPattern(digits12),
      groups: [digits12.slice(0, 1), digits12.slice(1, 7), digits12.slice(7, 11), digits12.slice(11, 12)],
      humanText: digits12,
    };
  }

  // Code 128 for alphanumeric (student IDs) and other non-UPC ids.
  const { bits, text } = encodeCode128B(raw);
  const show = text;
  return {
    kind: isNumeric(raw) ? 'numeric' : 'code128',
    digits: numeric.length ? numeric : '000000000000',
    pattern: bits,
    groups: ['', show, '', ''],
    humanText: show,
  };
};

