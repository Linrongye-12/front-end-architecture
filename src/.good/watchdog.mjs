// 编码守护进程：每 3 秒检查一次源码文件，发现 UTF-8 损坏（U+FFFD）立即从 .good 备份还原
// 日志写入 .good/watch.log —— 每次自动还原都会记录时间，可据此判断"凶手"的活动规律
//
// 加固历史：
//  2026-09-19 v2：还原前先校验 .good 备份自身完好；备份也损坏时只告警不还原，
//                 避免"坏备份覆盖好文件"造成二次破坏
//  2026-09-19 v3：监控范围从固定 10 个文件升级为 src 下全部 .vue/.ts/.css（动态扫描），
//                 新增文件启动时自动纳入备份；ROOT 改为按脚本位置解析，任意目录启动均可
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 脚本位于 src/.good/ 内，监控根目录为其上一级（src/）
const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const REPL = String.fromCharCode(0xFFFD);
const GOOD_DIR = path.join(ROOT, '.good');

// 动态构建监控清单：src 下全部 .vue/.ts/.css（不含 .good 备份目录自身）
function collectTargets(dir) {
  const out = [];
  for (const f of fs.readdirSync(dir)) {
    const p = path.join(dir, f);
    if (p === GOOD_DIR) continue;
    const st = fs.statSync(p);
    if (st.isDirectory()) out.push(...collectTargets(p));
    else if (/\.(vue|ts|css)$/.test(f)) out.push(p);
  }
  return out;
}
const PAIRS = collectTargets(ROOT).map((src) => [
  path.relative(ROOT, path.join(GOOD_DIR, path.relative(ROOT, src))),
  path.relative(ROOT, src),
]);

let restores = 0;
function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  fs.appendFileSync(path.join(GOOD_DIR, 'watch.log'), line);
  console.log(line.trim());
}

/** 文件按 UTF-8 解码后是否含 U+FFFD 替换符（无效字节序列解码时会产生该字符） */
function isCorrupted(rel) {
  try {
    return fs.readFileSync(path.join(ROOT, rel)).toString('utf8').includes(REPL);
  } catch (e) {
    log(`ERROR reading ${rel}: ${e.message}`);
    return false;
  }
}

// 启动自检：补齐缺失的备份（仅当源文件完好时），备份自身损坏则告警
for (const [good, target] of PAIRS) {
  const goodPath = path.join(ROOT, good);
  if (!fs.existsSync(goodPath)) {
    if (isCorrupted(target)) {
      log(`ALERT ${target} corrupted and no backup exists —— 需人工修复`);
    } else {
      fs.mkdirSync(path.dirname(goodPath), { recursive: true });
      fs.copyFileSync(path.join(ROOT, target), goodPath);
      log(`BACKUP-CREATED ${good} (new file added to protection)`);
    }
  } else if (isCorrupted(good)) {
    log(`ALERT backup itself corrupted: ${good} —— 请人工修复备份后再依赖自动还原`);
  }
}

log(`watchdog started, monitoring ${PAIRS.length} files`);

setInterval(() => {
  for (const [good, target] of PAIRS) {
    try {
      const cur = fs.readFileSync(path.join(ROOT, target)).toString('utf8');
      if (cur.includes(REPL)) {
        if (isCorrupted(good)) {
          log(`ALERT ${target} corrupted but backup ${good} is ALSO corrupted —— 跳过还原，需人工介入`);
          continue;
        }
        fs.copyFileSync(path.join(ROOT, good), path.join(ROOT, target));
        restores++;
        log(`RESTORED ${target} (corruption detected, auto-restored from backup, total=${restores})`);
      }
    } catch (e) {
      log(`ERROR checking ${target}: ${e.message}`);
    }
  }
}, 3000);
