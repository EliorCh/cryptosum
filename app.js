/* ---------------- DES (educational, BigInt-free, bit arrays) ---------------- */
const DES = (() => {
  const IP = [58,50,42,34,26,18,10,2,60,52,44,36,28,20,12,4,62,54,46,38,30,22,14,6,64,56,48,40,32,24,16,8,57,49,41,33,25,17,9,1,59,51,43,35,27,19,11,3,61,53,45,37,29,21,13,5,63,55,47,39,31,23,15,7];
  const FP = [40,8,48,16,56,24,64,32,39,7,47,15,55,23,63,31,38,6,46,14,54,22,62,30,37,5,45,13,53,21,61,29,36,4,44,12,52,20,60,28,35,3,43,11,51,19,59,27,34,2,42,10,50,18,58,26,33,1,41,9,49,17,57,25];
  const E = [32,1,2,3,4,5,4,5,6,7,8,9,8,9,10,11,12,13,12,13,14,15,16,17,16,17,18,19,20,21,20,21,22,23,24,25,24,25,26,27,28,29,28,29,30,31,32,1];
  const P = [16,7,20,21,29,12,28,17,1,15,23,26,5,18,31,10,2,8,24,14,32,27,3,9,19,13,30,6,22,11,4,25];
  const PC1 = [57,49,41,33,25,17,9,1,58,50,42,34,26,18,10,2,59,51,43,35,27,19,11,3,60,52,44,36,63,55,47,39,31,23,15,7,62,54,46,38,30,22,14,6,61,53,45,37,29,21,13,5,28,20,12,4];
  const PC2 = [14,17,11,24,1,5,3,28,15,6,21,10,23,19,12,4,26,8,16,7,27,20,13,2,41,52,31,37,47,55,30,40,51,45,33,48,44,49,39,56,34,53,46,42,50,36,29,32];
  const SHIFTS = [1,1,2,2,2,2,2,2,1,2,2,2,2,2,2,1];
  const S = [
   [[14,4,13,1,2,15,11,8,3,10,6,12,5,9,0,7],[0,15,7,4,14,2,13,1,10,6,12,11,9,5,3,8],[4,1,14,8,13,6,2,11,15,12,9,7,3,10,5,0],[15,12,8,2,4,9,1,7,5,11,3,14,10,0,6,13]],
   [[15,1,8,14,6,11,3,4,9,7,2,13,12,0,5,10],[3,13,4,7,15,2,8,14,12,0,1,10,6,9,11,5],[0,14,7,11,10,4,13,1,5,8,12,6,9,3,2,15],[13,8,10,1,3,15,4,2,11,6,7,12,0,5,14,9]],
   [[10,0,9,14,6,3,15,5,1,13,12,7,11,4,2,8],[13,7,0,9,3,4,6,10,2,8,5,14,12,11,15,1],[13,6,4,9,8,15,3,0,11,1,2,12,5,10,14,7],[1,10,13,0,6,9,8,7,4,15,14,3,11,5,2,12]],
   [[7,13,14,3,0,6,9,10,1,2,8,5,11,12,4,15],[13,8,11,5,6,15,0,3,4,7,2,12,1,10,14,9],[10,6,9,0,12,11,7,13,15,1,3,14,5,2,8,4],[3,15,0,6,10,1,13,8,9,4,5,11,12,7,2,14]],
   [[2,12,4,1,7,10,11,6,8,5,3,15,13,0,14,9],[14,11,2,12,4,7,13,1,5,0,15,10,3,9,8,6],[4,2,1,11,10,13,7,8,15,9,12,5,6,3,0,14],[11,8,12,7,1,14,2,13,6,15,0,9,10,4,5,3]],
   [[12,1,10,15,9,2,6,8,0,13,3,4,14,7,5,11],[10,15,4,2,7,12,9,5,6,1,13,14,0,11,3,8],[9,14,15,5,2,8,12,3,7,0,4,10,1,13,11,6],[4,3,2,12,9,5,15,10,11,14,1,7,6,0,8,13]],
   [[4,11,2,14,15,0,8,13,3,12,9,7,5,10,6,1],[13,0,11,7,4,9,1,10,14,3,5,12,2,15,8,6],[1,4,11,13,12,3,7,14,10,15,6,8,0,5,9,2],[6,11,13,8,1,4,10,7,9,5,0,15,14,2,3,12]],
   [[13,2,8,4,6,15,11,1,10,9,3,14,5,0,12,7],[1,15,13,8,10,3,7,4,12,5,6,11,0,14,9,2],[7,11,4,1,9,12,14,2,0,6,10,13,15,3,5,8],[2,1,14,7,4,10,8,13,15,12,9,0,3,5,6,11]]
  ];
  const hexToBits = h => { h = h.replace(/\s+/g, '').toUpperCase(); if(!/^[0-9A-F]{16}$/.test(h)) throw new Error('נדרשים בדיוק 16 תווי hex (64 ביט)'); return [...h].flatMap(c => parseInt(c, 16).toString(2).padStart(4, '0').split('').map(Number)); };
  const bitsToHex = b => { let s = ''; for(let i = 0; i < b.length; i += 4) s += parseInt(b.slice(i, i + 4).join(''), 2).toString(16).toUpperCase(); return s; };
  const perm = (bits, t) => t.map(i => bits[i - 1]);
  const xor = (a, b) => a.map((x, i) => x ^ b[i]);
  const rotl = (a, n) => a.slice(n).concat(a.slice(0, n));
  function sbox(i, six){ const row = six[0] * 2 + six[5], col = six[1] * 8 + six[2] * 4 + six[3] * 2 + six[4]; return {row, col, val: S[i][row][col]}; }
  function f(R, K){
    const e = perm(R, E), x = xor(e, K), out = [], boxes = [];
    for(let i = 0; i < 8; i++){ const six = x.slice(6 * i, 6 * i + 6), s = sbox(i, six); boxes.push({six, ...s}); out.push(...s.val.toString(2).padStart(4, '0').split('').map(Number)); }
    return {e, x, s: out, p: perm(out, P), boxes};
  }
  function keys(k64){
    const pc1 = perm(k64, PC1); let C = pc1.slice(0, 28), D = pc1.slice(28); const ks = [];
    for(let i = 0; i < 16; i++){ C = rotl(C, SHIFTS[i]); D = rotl(D, SHIFTS[i]); ks.push({C, D, K: perm(C.concat(D), PC2)}); }
    return {pc1, ks};
  }
  function run(blockHex, keyHex, decrypt){
    const x = hexToBits(blockHex), k = hexToBits(keyHex), sched = keys(k);
    const order = decrypt ? sched.ks.slice().reverse() : sched.ks;
    const ip = perm(x, IP); let L = ip.slice(0, 32), R = ip.slice(32); const rounds = [];
    for(let i = 0; i < 16; i++){ const K = order[i].K, fr = f(R, K); const nR = xor(L, fr.p); rounds.push({i: i + 1, K, f: fr, L: R, R: nR}); L = R; R = nR; }
    const out = perm(R.concat(L), FP);
    return {ip, rounds, out, outHex: bitsToHex(out), sched};
  }
  return {IP, FP, E, P, PC1, PC2, SHIFTS, S, hexToBits, bitsToHex, sbox, run, keys};
})();


/* ---------------- helpers ---------------- */
const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
function big(id){ const v = $(id).value.trim(); if(!/^-?\d+$/.test(v)) throw new Error('הערך "' + v + '" אינו מספר שלם'); return BigInt(v); }
const mod = (a, n) => ((a % n) + n) % n;
function gcd(a, b){ a = a < 0n ? -a : a; b = b < 0n ? -b : b; while(b){ [a, b] = [b, a % b]; } return a; }
function isPrime(n){ if(n < 2n) return false; if(n < 4n) return true; if(n % 2n === 0n) return false; for(let i = 3n; i * i <= n; i += 2n){ if(n % i === 0n) return false; } return true; }
function factor(n){ const f = []; let d = 2n; while(d * d <= n){ let k = 0; while(n % d === 0n){ n /= d; k++; } if(k) f.push([d, k]); d += d === 2n ? 1n : 2n; } if(n > 1n) f.push([n, 1]); return f; }
const factStr = f => f.map(([p, k]) => k > 1 ? p + '^' + k : '' + p).join(' · ');
function powmod(x, e, n){ let r = 1n; x = mod(x, n); while(e > 0n){ if(e & 1n) r = r * x % n; x = x * x % n; e >>= 1n; } return r; }
function table(head, rows, hlLast){
  let h = '<div class="tbl-wrap"><table><tr>' + head.map(x => '<th class="num">' + x + '</th>').join('') + '</tr>';
  rows.forEach((r, i) => { h += '<tr' + (hlLast && i === rows.length - 1 ? ' class="hl"' : '') + '>' + r.map(x => '<td class="num">' + x + '</td>').join('') + '</tr>'; });
  return h + '</table></div>';
}
function fail(out, e){ $(out).innerHTML = '<p class="msg-bad">' + esc(e.message) + '</p>'; }

/* ---------------- Caesar ---------------- */
function shift(t, k){ return t.toUpperCase().replace(/[A-Z]/g, c => String.fromCharCode((c.charCodeAt(0) - 65 + k + 26 * 10) % 26 + 65)); }
function caesarRun(){ const t = $('cz-in').value, k = parseInt($('cz-k').value) || 0; $('cz-out').textContent = 'k = ' + k + ' :  ' + t.toUpperCase() + '  →  ' + shift(t, k); }
function caesarBrute(){ const t = $('cz-in').value; let s = 'Trying all keys (decryption = shift by −k):\n'; for(let k = 1; k <= 25; k++){ s += 'k=' + String(k).padStart(2) + ' : ' + shift(t, -k) + '\n'; } $('cz-out').textContent = s; }

/* ---------------- XOR ---------------- */
function xorRun(){
  let p = $('xr-p').value.trim(), k = $('xr-k').value.trim();
  let pb = /^[01]{8}$/.test(p) ? p : (p.length ? p.charCodeAt(0).toString(2).padStart(8, '0').slice(-8) : '00000000');
  if(!/^[01]{8}$/.test(k)){ $('xr-out').textContent = 'The key must be exactly 8 bits (0/1).'; return; }
  const x = (a, b) => [...a].map((c, i) => c === b[i] ? '0' : '1').join('');
  const c = x(pb, k), back = x(c, k);
  const ch = s => { const v = parseInt(s, 2); return v >= 32 && v < 127 ? ' (' + String.fromCharCode(v) + ')' : ''; };
  $('xr-out').textContent = 'Plaintext : ' + pb + ch(pb) + '\nKey       : ' + k + '\n            --------  XOR\nCiphertext: ' + c + '\nKey       : ' + k + '\n            --------  XOR\nDecrypted : ' + back + ch(back) + (back === pb ? '   ✓ identical' : '');
}

/* ---------------- EEA ---------------- */
function eeaRows(a, b){
  const rows = [[0, a, '—', 1n, 0n], [1, b, '—', 0n, 1n]];
  while(rows[rows.length - 1][1] !== 0n){
    const [, r0, , s0, t0] = rows[rows.length - 2], [, r1, , s1, t1] = rows[rows.length - 1];
    const q = r0 / r1; rows.push([rows.length, r0 - q * r1, q, s0 - q * s1, t0 - q * t1]);
  }
  return rows;
}
function eeaHtml(a, b){
  const rows = eeaRows(a, b);
  const g = rows[rows.length - 2][1];
  const shown = rows.slice(0, -1);   // drop the final r=0 row for readability
  let h = table(['i', 'r', 'q', 's', 't', 's·' + a + ' + t·' + b], shown.map(r => [r[0], r[1], r[2], r[3], r[4], r[3] * a + r[4] * b]), true);
  const last = shown[shown.length - 1];
  h += '<div class="out rtl">';
  h += 'gcd(' + a + ', ' + b + ') = <b class="ltr">' + g + '</b>. ';
  if(g === 1n){
    const inv = mod(last[4], a);
    h += 'ההופכי של <span class="ltr">' + b + '</span> מודולו <span class="ltr">' + a + '</span> הוא <span class="ltr">t = ' + last[4] + '</span>' + (last[4] < 0n ? ' ← שלילי, מוסיפים ' + a + ': <b class="ltr">' + inv + '</b>' : ' = <b class="ltr">' + inv + '</b>') +
         '.<br>בדיקה: <span class="ltr">' + b + ' · ' + inv + ' = ' + (b * inv) + ' = ' + (b * inv / a) + '·' + a + ' + ' + (b * inv % a) + '</span> <span class="msg-ok">✓</span>';
  } else h += '<span class="msg-bad">ה־gcd אינו 1 — אין הופכי מודולרי.</span>';
  return h + '</div>';
}
function eeaRun(){ try{ const a = big('ee-a'), b = big('ee-b'); if(a <= 0n || b <= 0n) throw new Error('הכנס מספרים חיוביים'); $('ee-out').innerHTML = eeaHtml(a, b); } catch(e){ fail('ee-out', e); } }

/* ---------------- Square & Multiply ---------------- */
function samTrace(x, e, n){
  const bits = e.toString(2), rows = []; let z = mod(x, n), sq = 0, mu = 0;
  rows.push(['1', 'start', '—', '—', z]);
  for(const b of bits.slice(1)){
    const before = z; z = z * z % n; sq++;
    let sqs = before + '² = ' + (before * before) + ' ≡ ' + z;
    if(b === '1'){ const s = z; z = z * mod(x, n) % n; mu++; rows.push([b, 'Sq + Mul', sqs, s + '·' + mod(x, n) + ' = ' + (s * mod(x, n)) + ' ≡ ' + z, z]); }
    else rows.push([b, 'Sq', sqs, '—', z]);
  }
  return {bits, rows, sq, mu, z};
}
function samHtml(x, e, n){
  if(e <= 0n) throw new Error('המעריך חייב להיות חיובי');
  const t = samTrace(x, e, n);
  let h = '<div class="out rtl">המעריך בבינארי: <span class="ltr">' + e + ' = ' + t.bits + '₂</span> (' + t.bits.length + ' ביטים)</div>';
  h += table(['bit', 'action', 'square (mod ' + n + ')', 'multiply by ' + mod(x, n), 'z'], t.rows, true);
  h += '<div class="out rtl">התוצאה: <b class="ltr">' + x + '^' + e + ' mod ' + n + ' = ' + t.z + '</b> · ריבועים: ' + t.sq + ' · כפלים: ' + t.mu + ' · סה״כ ' + (t.sq + t.mu) + ' פעולות (נאיבי: <span class="ltr">' + (e - 1n) + '</span>)</div>';
  return h;
}
function samRun(){ try{ const n = big('sm-n'); if(n < 2n) throw new Error('n חייב להיות לפחות 2'); $('sm-out').innerHTML = samHtml(big('sm-x'), big('sm-e'), n); } catch(e){ fail('sm-out', e); } }

/* ---------------- RSA ---------------- */
function rsaRun(){
  try{
    const p = big('rsa-p'), q = big('rsa-q'), M = big('rsa-m');
    if(!isPrime(p)) throw new Error('p = ' + p + ' אינו ראשוני (' + factStr(factor(p)) + ')');
    if(!isPrime(q)) throw new Error('q = ' + q + ' אינו ראשוני (' + factStr(factor(q)) + ')');
    if(p === q) throw new Error('p ו־q חייבים להיות שונים');
    const n = p * q, ph = (p - 1n) * (q - 1n);
    let e, ev = $('rsa-e').value.trim();
    if(ev === ''){ e = 3n; while(gcd(e, ph) !== 1n) e += 2n; } else e = BigInt(ev);
    let h = '<h4>שלבים 1–3</h4><div class="out">n    = ' + p + ' · ' + q + ' = ' + n + '\nφ(n) = (' + p + '−1)(' + q + '−1) = ' + (p - 1n) + ' · ' + (q - 1n) + ' = ' + ph + ' = ' + factStr(factor(ph)) + '</div>';
    h += '<h4>שלב 4 — בדיקת e</h4>';
    if(e <= 1n || e >= ph){ $('rsa-out').innerHTML = h + '<p class="msg-bad">e חייב לקיים 1 &lt; e &lt; φ(n)</p>'; return; }
    const g = gcd(e, ph);
    h += '<div class="out">gcd(' + e + ', ' + ph + ') = ' + g + (g === 1n ? '   ✓ valid' : '   ✗ not valid — choose another e') + '</div>';
    if(g !== 1n){ $('rsa-out').innerHTML = h; return; }
    h += '<h4>שלב 5 — d בעזרת אוקלידס המורחב</h4>' + eeaHtml(ph, e);
    const d = mod(eeaRows(ph, e).slice(-2)[0][4], ph);
    h += '<h4>שלב 6 — המפתחות</h4><div class="out">public  (n, e) = (' + n + ', ' + e + ')\nprivate (n, d) = (' + n + ', ' + d + ')</div>';
    if(M < 0n) throw new Error('M חייב להיות אי־שלילי');
    if(M >= n) h += '<p class="msg-bad">⚠️ M = ' + M + ' ≥ n = ' + n + ' — הפענוח יחזיר את M mod n = ' + (M % n) + ' ולא את M (ראו שאלה 2 בתרגיל).</p>';
    h += '<h4>הצפנה: <span class="ltr">C = ' + M + '^' + e + ' mod ' + n + '</span></h4>' + samHtml(M, e, n);
    const C = powmod(M, e, n);
    h += '<h4>פענוח: <span class="ltr">M = ' + C + '^' + d + ' mod ' + n + '</span></h4>' + samHtml(C, d, n);
    const back = powmod(C, d, n);
    h += '<p class="' + (back === M ? 'msg-ok' : 'msg-bad') + '">' + (back === M ? '✓ הפענוח החזיר את M = ' + M : '✗ הפענוח החזיר ' + back + ' ולא ' + M) + '</p>';
    $('rsa-out').innerHTML = h;
  } catch(e){ fail('rsa-out', e); }
}

/* ---------------- groups ---------------- */
function groupRun(){
  try{
    const p = Number(big('gr-p'));
    if(p < 3 || p > 200 || !isPrime(BigInt(p))) throw new Error('הכנס ראשוני בין 3 ל־200');
    const pf = factor(BigInt(p - 1)).map(x => Number(x[0]));
    let rows = [], gens = [];
    for(let a = 1; a < p; a++){
      let v = a, k = 1, seq = [a]; while(v !== 1){ v = v * a % p; k++; seq.push(v); }
      const isG = k === p - 1; if(isG) gens.push(a);
      const test = pf.map(q => a + '^' + ((p - 1) / q) + '≡' + Number(powmod(BigInt(a), BigInt((p - 1) / q), BigInt(p)))).join(' , ');
      rows.push('<tr' + (isG ? ' class="good"' : '') + '><td class="num">' + a + '</td><td class="num">' + (seq.length > 24 ? seq.slice(0, 24).join(' ') + ' …' : seq.join(' ')) + '</td><td class="num">' + k + '</td><td class="num">' + test + '</td><td>' + (isG ? 'כן ★' : 'לא') + '</td></tr>');
    }
    let h = '<div class="out rtl">גודל החבורה <span class="ltr">p − 1 = ' + (p - 1) + ' = ' + factStr(factor(BigInt(p - 1))) + '</span>. יוצרים: <b class="ltr">{' + gens.join(', ') + '}</b> — סה״כ ' + gens.length + ' = φ(' + (p - 1) + ') ✓</div>';
    h += '<div class="tbl-wrap"><table><tr><th>a</th><th>a¹, a², … עד 1</th><th>סדר</th><th>מבחן היוצר</th><th>יוצר?</th></tr>' + rows.join('') + '</table></div>';
    $('gr-out').innerHTML = h;
  } catch(e){ fail('gr-out', e); }
}

/* ---------------- Diffie-Hellman ---------------- */
function dhRun(){
  try{
    const p = big('dh-p'), g = big('dh-g'), a = big('dh-a'), b = big('dh-b');
    if(!isPrime(p)) throw new Error('p חייב להיות ראשוני');
    if(g <= 1n || g >= p) throw new Error('g חייב להיות בטווח 2 … p−1');
    let h = '';
    const pf = factor(p - 1n).map(x => x[0]);
    const tests = pf.map(q => [q, powmod(g, (p - 1n) / q, p)]);
    const isGen = tests.every(t => t[1] !== 1n);
    h += '<h4>שלב 0 — האם g יוצר?</h4><div class="out">p − 1 = ' + (p - 1n) + ' = ' + factStr(factor(p - 1n)) + '\n' + tests.map(t => g + '^(' + (p - 1n) + '/' + t[0] + ') = ' + g + '^' + ((p - 1n) / t[0]) + ' mod ' + p + ' = ' + t[1] + (t[1] === 1n ? '   ✗ = 1' : '   ≠ 1')).join('\n') + '\n→ ' + (isGen ? 'g is a generator ✓' : 'g is NOT a generator ✗') + '</div>';
    if(a < 2n || a > p - 2n || b < 2n || b > p - 2n) h += '<p class="msg-bad">⚠️ מומלץ לבחור סודות בטווח 2 … p−2</p>';
    const A = powmod(g, a, p), B = powmod(g, b, p);
    h += '<h4>אליס: <span class="ltr">A = ' + g + '^' + a + ' mod ' + p + '</span></h4>' + samHtml(g, a, p);
    h += '<h4>בוב: <span class="ltr">B = ' + g + '^' + b + ' mod ' + p + '</span></h4>' + samHtml(g, b, p);
    h += '<div class="out rtl">על הערוץ (איב רואה): <span class="ltr">p = ' + p + ', g = ' + g + ', A = ' + A + ', B = ' + B + '</span></div>';
    h += '<h4>אליס: <span class="ltr">K = B^a = ' + B + '^' + a + ' mod ' + p + '</span></h4>' + samHtml(B, a, p);
    h += '<h4>בוב: <span class="ltr">K = A^b = ' + A + '^' + b + ' mod ' + p + '</span></h4>' + samHtml(A, b, p);
    const K1 = powmod(B, a, p), K2 = powmod(A, b, p);
    h += '<p class="' + (K1 === K2 ? 'msg-ok' : 'msg-bad') + '">' + (K1 === K2 ? '✓ שני הצדדים קיבלו K = ' + K1 + ' (בדיקה: g^(ab) mod p = ' + powmod(g, a * b, p) + ')' : '✗ שונה') + '</p>';
    $('dh-out').innerHTML = h;
  } catch(e){ fail('dh-out', e); }
}

/* ---------------- BSGS ---------------- */
function bsgsRun(){
  try{
    const p = big('bs-p'), g = big('bs-g'), y = big('bs-y');
    if(!isPrime(p) || p > 1000000n) throw new Error('p חייב להיות ראשוני עד 1,000,000');
    const n = p - 1n; let m = 0n; while(m * m < n) m++;
    const T = new Map(), baby = [];
    for(let j = 0n; j < m; j++){ const v = powmod(g, j, p); if(!T.has(v)) T.set(v, j); baby.push([j, v]); }
    const gm = powmod(g, m, p), ginv = powmod(gm, p - 2n, p);
    let h = '<div class="out">n = ' + n + ' ,  m = ⌈√' + n + '⌉ = ' + m + '\nγ = g^m = ' + g + '^' + m + ' mod ' + p + ' = ' + gm + ' ,  γ⁻¹ = ' + ginv + '   (check: ' + gm + '·' + ginv + ' mod ' + p + ' = ' + (gm * ginv % p) + ')</div>';
    h += '<h4>צעדי תינוק</h4>' + (m <= 40n ? table(['j', 'g^j mod ' + p], baby.map(r => [r[0], r[1]])) : '<div class="out rtl">(' + m + ' ערכים — הטבלה גדולה מדי להצגה)</div>');
    let cur = mod(y, p), giant = [], found = null;
    for(let i = 0n; i < m; i++){
      if(T.has(cur)){ found = [i, T.get(cur)]; giant.push([i, cur, 'j = ' + T.get(cur) + ' ✓']); break; }
      giant.push([i, cur, '—']); cur = cur * ginv % p;
    }
    h += '<h4>צעדי ענק</h4>' + table(['i', 'β·γ^(−i)', 'in table?'], giant.slice(-40), !!found);
    if(found){ const x = found[0] * m + found[1]; h += '<p class="msg-ok">x = i·m + j = ' + found[0] + '·' + m + ' + ' + found[1] + ' = ' + x + ' · בדיקה: ' + g + '^' + x + ' mod ' + p + ' = ' + powmod(g, x, p) + '</p>'; }
    else h += '<p class="msg-bad">לא נמצא פתרון — ייתכן ש־g אינו יוצר ו־β לא בתת־החבורה שלו.</p>';
    $('bs-out').innerHTML = h;
  } catch(e){ fail('bs-out', e); }
}

/* ---------------- static diagrams built by script ---------------- */
(function clock(){
  const g = document.getElementById('clk'); if(!g) return; let s = '';
  for(let h = 0; h < 24; h++){ const a = h / 24 * 2 * Math.PI, x = 150 + 92 * Math.sin(a), y = 150 - 92 * Math.cos(a) + 5;
    s += '<text x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '"' + (h === 8 ? ' fill="#b91c1c" font-size="18"' : h === 12 ? ' fill="#64748b" font-size="18"' : '') + '>' + h + '</text>'; }
  g.innerHTML = s;
})();
(function cyc(){
  const svg = document.getElementById('cyc-svg'); if(!svg) return; const p = 11;
  const pos = k => { const a = (k - 1) / 10 * 2 * Math.PI; return [Math.sin(a), -Math.cos(a)]; };
  let s = '<defs><marker id="cy" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#0f766e"/></marker><marker id="cy2" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto"><path d="M0,0 L8,4 L0,8 z" fill="#b45309"/></marker></defs>';
  const draw = (cx, base, col, mk, title) => {
    const R = 105; let pts = {}; for(let v = 1; v <= 10; v++){ const [sx, sy] = pos(v); pts[v] = [cx + R * sx, 150 + R * sy]; }
    let seq = [], v = 1; do { v = v * base % p; seq.push(v); } while(v !== 1);
    let prev = 1, arrows = '';
    seq.forEach(w => { const [x1, y1] = pts[prev], [x2, y2] = pts[w]; const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy) || 1;
      arrows += '<line x1="' + (x1 + dx / L * 16).toFixed(1) + '" y1="' + (y1 + dy / L * 16).toFixed(1) + '" x2="' + (x2 - dx / L * 18).toFixed(1) + '" y2="' + (y2 - dy / L * 18).toFixed(1) + '" stroke="' + col + '" stroke-width="1.8" marker-end="url(#' + mk + ')"/>'; prev = w; });
    let nodes = ''; for(let w = 1; w <= 10; w++){ const on = seq.includes(w); const [x, y] = pts[w];
      nodes += '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="15" fill="' + (on ? '#fff' : '#eee') + '" stroke="' + (on ? col : '#bbb') + '" stroke-width="2"/><text x="' + x.toFixed(1) + '" y="' + (y + 5).toFixed(1) + '" text-anchor="middle" font-size="14" fill="' + (on ? '#14213d' : '#aaa') + '">' + w + '</text>'; }
    return arrows + nodes + '<text x="' + cx + '" y="285" text-anchor="middle" font-size="15" font-weight="700">' + title + '</text>';
  };
  s += draw(155, 2, '#0f766e', 'cy', 'powers of 2 : ord = 10') + draw(465, 3, '#b45309', 'cy2', 'powers of 3 : ord = 5');
  svg.innerHTML = s;
})();

/* ---------------- quiz ---------------- */
const QUIZ = [
 ['לפי עקרון קרקהוף, מה חייב להישאר סודי?', ['האלגוריתם', 'המפתח בלבד', 'גם האלגוריתם וגם המפתח', 'אורך ההודעה'], 1, 'כל המערכת יכולה להיות ציבורית; הביטחון נשען רק על המפתח.'],
 ['למה צופן החלפה נשבר למרות <span class="ltr">26! ≈ 2^88</span> מפתחות?', ['כי אפשר לנסות את כל המפתחות', 'כי תדירות האותיות נשמרת', 'כי המפתח קצר מההודעה', 'כי הוא משתמש ב־XOR'], 1, 'ניתוח תדירויות: ההחלפה משנה את שם האות אבל לא את שכיחותה.'],
 ['מה קורה אם משתמשים באותו מפתח OTP פעמיים?', ['שום דבר, OTP תמיד בטוח', 'התוקף מקבל את המפתח ישירות', '<span class="ltr">C1 ⊕ C2 = P1 ⊕ P2</span> — המפתח מתבטל', 'ההודעה השנייה לא ניתנת לפענוח'], 2, 'המפתח מתבטל ב־XOR ונשאר XOR של שתי ההודעות.'],
 ['מה התכונה של ECB שמאפשרת את התקפת החלפת הבלוקים?', ['כל בלוק מוצפן בנפרד עם אותו מפתח', 'הוא משתמש ב־IV אקראי', 'הוא צופן זרם', 'המפתח קצר מדי'], 0, 'בלוקים עצמאיים ← אפשר להזיז ולהחליף אותם והפענוח עדיין מצליח.'],
 ['<span class="ltr">p = 7, q = 11</span>. מהו <span class="ltr">φ(n)</span>?', ['77', '60', '70', '66'], 1, '<span class="ltr">(7−1)(11−1) = 6 · 10 = 60</span>.'],
 ['עם <span class="ltr">φ(n) = 60</span>, איזה e חוקי?', ['e = 6', 'e = 15', 'e = 7', 'e = 10'], 2, 'רק 7 זר ל־60 (<span class="ltr">gcd(7,60)=1</span>). ההופכי: <span class="ltr">d = 43</span>, כי <span class="ltr">7·43 = 301 = 5·60 + 1</span>.'],
 ['כמה ביטים של המעריך גורמים לפעולת כפל באלגוריתם ריבוע וכפל?', ['כל הביטים', 'רק ביטי 1 (חוץ מהראשון)', 'רק ביטי 0', 'אף אחד'], 1, '"ריבוע תמיד, כפל רק על 1". הביט הראשון הוא נקודת ההתחלה <span class="ltr">z = x</span>.'],
 ['בהתקפת ערוץ צד על RSA, מה חושף שהביט של d הוא 1?', ['זמן/הספק ארוך יותר — יש גם ריבוע וגם כפל', 'הודעת שגיאה', 'גודל הטקסט המוצפן', 'ה־IV'], 0, 'ביט 1 = ריבוע + כפל, ביט 0 = רק ריבוע; העקבה מסגירה את הביטים.'],
 ['ב־<span class="ltr">Z11*</span>, מה הסדר של 10?', ['10', '5', '2', '1'], 2, '<span class="ltr">10 ≡ −1</span>, ולכן <span class="ltr">10² ≡ 1</span>.'],
 ['ב־DH, אליס קיבלה B מבוב. איך היא מחשבת את המפתח?', ['<span class="ltr">K = A^b</span>', '<span class="ltr">K = B^a mod p</span>', '<span class="ltr">K = g^B mod p</span>', '<span class="ltr">K = A · B mod p</span>'], 1, 'אליס מכירה את a ואת B: <span class="ltr">K = B^a = g^(ab)</span>.'],
 ['מה סיבוכיות הזמן של Baby-Step Giant-Step בחבורה בגודל n?', ['O(n)', 'O(log n)', 'O(√n)', 'O(1)'], 2, 'שני חלקים של <span class="ltr">m = ⌈√n⌉</span> צעדים כל אחד.'],
 ['מה שורש הבעיה בהתקפת MITM על DH?', ['ה־DLP קל', 'p קטן מדי', 'אין אימות של הצדדים', 'g אינו יוצר'], 2, 'איב לא פותרת DLP; היא פשוט מתחזה לכל צד. הפתרון: חתימות/תעודות.']
];
(function buildQuiz(){
  const box = $('quiz-box'); if(!box) return; let score = 0, answered = 0;
  QUIZ.forEach((q, i) => {
    const d = document.createElement('div'); d.className = 'box exercise';
    d.innerHTML = '<div class="box-head">שאלה ' + (i + 1) + '</div><div class="box-body"><p>' + q[0] + '</p><div class="chips">' + q[1].map((o, j) => '<button class="ghost" data-j="' + j + '">' + o + '</button>').join('') + '</div><p class="fb" style="display:none"></p></div>';
    d.querySelectorAll('button').forEach(b => b.onclick = () => {
      if(d.dataset.done) return; d.dataset.done = 1; answered++;
      const j = +b.dataset.j, ok = j === q[2]; if(ok) score++;
      d.querySelectorAll('button').forEach(x => { const k = +x.dataset.j; x.style.background = k === q[2] ? '#15803d' : (k === j ? '#b91c1c' : '#e7ecf5'); x.style.color = (k === q[2] || k === j) ? '#fff' : '#14213d'; });
      const fb = d.querySelector('.fb'); fb.style.display = 'block'; fb.innerHTML = '<span class="' + (ok ? 'msg-ok' : 'msg-bad') + '">' + (ok ? '✓ נכון.' : '✗ לא בדיוק.') + '</span> ' + q[3];
      $('quiz-score').textContent = 'ציון: ' + score + ' / ' + answered + (answered === QUIZ.length ? ' — סיימת!' : '');
    });
    box.appendChild(d);
  });
})();

/* ---------------- sidebar: active link + progress ---------------- */
(function nav(){
  const links = [...document.querySelectorAll('nav.side a[href^="#"]')];
  const targets = links.map(a => document.getElementById(a.getAttribute('href').slice(1))).filter(Boolean);
  function upd(){
    if (!targets.length) return; let cur = targets[0];
    for(const t of targets){ if(t.getBoundingClientRect().top < 120) cur = t; }
    links.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + cur.id));
    const h = document.documentElement, pr = $('prog'); if (pr) pr.style.width = (100 * h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight)) + '%';
  }
  addEventListener('scroll', upd, {passive: true}); upd();
  links.forEach(a => a.addEventListener('click', () => document.querySelector('nav.side').classList.remove('open')));
})();

/* run labs once with defaults */
[caesarRun, xorRun, eeaRun, samRun, rsaRun, groupRun, dhRun, bsgsRun].forEach(f => { try { f(); } catch(e) {} });
/* ---------------- chapter 4 labs ---------------- */
const g6 = b => b.join('').match(/.{1,6}/g).join(' ');
const g4 = b => b.join('').match(/.{1,4}/g).join(' ');
function sboxRun(){
  try{
    const i = +$('sb-i').value - 1, x = $('sb-x').value.trim();
    if(!/^[01]{6}$/.test(x)) throw new Error('נדרשים בדיוק 6 ביטים (0/1)');
    const r = DES.sbox(i, x.split('').map(Number));
    let h = '<div class="out rtl">שורה = הביטים החיצוניים <span class="ltr">' + x[0] + x[5] + '₂ = ' + r.row + '</span> · עמודה = הביטים הפנימיים <span class="ltr">' + x.slice(1, 5) + '₂ = ' + r.col + '</span> ← <b class="ltr">S' + (i + 1) + '(' + x + ') = ' + r.val + ' = ' + r.val.toString(2).padStart(4, '0') + '</b></div>';
    h += '<div class="tbl-wrap"><table dir="ltr" class="ltr-table"><tr><th>S' + (i + 1) + '</th>' + [...Array(16).keys()].map(c => '<th class="num">' + c + '</th>').join('') + '</tr>';
    DES.S[i].forEach((row, ri) => { h += '<tr><th class="num">' + ri + '</th>' + row.map((v, ci) => '<td class="num"' + (ri === r.row && ci === r.col ? ' style="background:#f2b84b;font-weight:800"' : (ri === r.row || ci === r.col ? ' style="background:#fff8e7"' : '')) + '>' + v + '</td>').join('') + '</tr>'; });
    $('sb-out').innerHTML = h + '</table></div>';
  } catch(e){ fail('sb-out', e); }
}
function desRun(dec){
  try{
    const r = DES.run($('des-x').value, $('des-k').value, dec);
    let h = '<div class="out">IP(x) = ' + DES.bitsToHex(r.ip) + '   →  L0 = ' + DES.bitsToHex(r.ip.slice(0, 32)) + ' , R0 = ' + DES.bitsToHex(r.ip.slice(32)) + '\n' + (dec ? 'decryption: round keys used in reverse order (K16 … K1)' : 'encryption: round keys K1 … K16') + '</div>';
    h += table(['round', 'key used (hex)', 'f(R, K) (hex)', 'L', 'R'], r.rounds.map(x => [x.i, (dec ? 'K' + (17 - x.i) : 'K' + x.i) + ' = ' + DES.bitsToHex(x.K.concat([0,0,0,0])).slice(0, 12), DES.bitsToHex(x.f.p), DES.bitsToHex(x.L), DES.bitsToHex(x.R)]), false);
    h += '<div class="out">swap → (R16, L16) , IP⁻¹  →  ' + (dec ? 'plaintext' : 'ciphertext') + ' = <b>' + r.outHex + '</b></div>';
    $('des-out').innerHTML = h;
  } catch(e){ fail('des-out', e); }
}
function avalancheRun(){
  try{
    const x = $('av-x').value, k = $('av-k').value, b = +$('av-b').value;
    if(!(b >= 1 && b <= 64)) throw new Error('ביט בין 1 ל־64');
    const bits = DES.hexToBits(x); bits[b - 1] ^= 1; const x2 = DES.bitsToHex(bits);
    const a = DES.run(x, k), c = DES.run(x2, k);
    const diff = a.out.map((v, i) => v !== c.out[i] ? '^' : ' ').join('');
    const n = a.out.filter((v, i) => v !== c.out[i]).length;
    const per = a.rounds.map((r, i) => { const A = r.L.concat(r.R), C = c.rounds[i].L.concat(c.rounds[i].R); return A.filter((v, j) => v !== C[j]).length; });
    let h = '<div class="out">x  = ' + x.toUpperCase() + '\nx\' = ' + x2 + '   (bit ' + b + ' flipped)\n\ny  = ' + g4(a.out) + '\ny\' = ' + g4(c.out) + '\n     ' + diff.match(/.{1,4}/g).join(' ') + '</div>';
    h += '<div class="out rtl">בפלט השתנו <b>' + n + ' מתוך 64</b> ביטים (' + Math.round(n / 64 * 100) + '%). המטרה: בערך חצי.</div>';
    h += table(['after round'].concat(per.map((_, i) => i + 1)), [['bits different'].concat(per)]);
    $('av-out').innerHTML = h;
  } catch(e){ fail('av-out', e); }
}
[sboxRun, avalancheRun, () => desRun(false)].forEach(f => { try { f(); } catch(e) {} });
