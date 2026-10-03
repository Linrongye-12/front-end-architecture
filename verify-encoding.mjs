// 纯字节级 UTF-8 校验：不依赖任何特殊字符字面量
import fs from 'fs';
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = d + '/' + f;
    if (f === 'node_modules' || f === '.git' || f === 'dist') continue;
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (/\.(vue|ts|css|html)$/.test(f)) files.push(p);
  }
})('src');

const NEEDLE = Buffer.from([0xEF, 0xBF, 0xBD]);
const decoder = new TextDecoder('utf-8', { fatal: true });
let bad = 0;
for (const p of files.sort()) {
  const b = fs.readFileSync(p);
  let n = 0, i = 0;
  while ((i = b.indexOf(NEEDLE, i)) !== -1) { n++; i += 3; }
  let valid = true;
  try { decoder.decode(b); } catch { valid = false; }
  // 统计字面 0x3F 紧跟在多字节序列中的可疑替换（lead/continuation + 3F 模式）
  let q3f = 0;
  for (let j = 0; j < b.length - 1; j++) {
    if (b[j] === 0x3F && b[j + 1] !== undefined) {
      const prev = j > 0 ? b[j - 1] : 0;
      if (prev >= 0x80) q3f++; // '?' 紧跟在非 ASCII 字节之后，疑似截断替换
    }
  }
  if (n > 0 || !valid || q3f > 0) {
    bad++;
    console.log(`BAD ${p}  EFBFBD=${n}  validUTF8=${valid}  suspicious3F=${q3f}`);
  }
}
console.log(bad === 0 ? 'ALL FILES CLEAN (valid UTF-8, no replacement bytes)' : `${bad} file(s) still corrupted`);
