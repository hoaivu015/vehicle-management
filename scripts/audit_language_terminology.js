#!/usr/bin/env node
/**
 * Auto 28 Language & Terminology Inspector Script
 * Kiểm định tự động 5 lớp phòng thủ Ngôn ngữ Viết, Thuật ngữ SSoT Kế toán & Showroom:
 * 1. Anti-Colloquial & Anti-Slang (Chống khẩu ngữ & tiếng lóng buôn xe) [25 pts]
 * 2. Auto 28 Domain Lexicon SSoT Kế toán & Ô tô [25 pts]
 * 3. Actionable UX Writing & Microcopy (Thông báo lỗi 3 thành phần & Button CTA) [25 pts]
 * 4. Typography, Casing & Formatting Governance [25 pts]
 */

import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

console.log(`\n${COLORS.cyan}${COLORS.bright}══════════════════════════════════════════════════════════════════${COLORS.reset}`);
console.log(`${COLORS.cyan}${COLORS.bright}   ✍️  AUTO 28 SHOWROOM MANAGER — LANGUAGE & TERMINOLOGY AUDIT   ${COLORS.reset}`);
console.log(`${COLORS.cyan}${COLORS.bright}══════════════════════════════════════════════════════════════════${COLORS.reset}\n`);

function getAllFiles(dir, exts = ['.ts', '.tsx']) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      if (!['node_modules', '.git', 'dist', 'graphify-out', '__tests__'].includes(file)) {
        results = results.concat(getAllFiles(fullPath, exts));
      }
    } else {
      if (exts.some(ext => file.endsWith(ext)) && !file.includes('.test.') && !file.includes('.spec.')) {
        results.push(fullPath);
      }
    }
  });
  return results;
}

const sourceFiles = getAllFiles(path.join(ROOT_DIR, 'src'));

let passedCategories = 0;
const totalCategories = 4;
const issues = [];

function checkCategory(title, points, rules) {
  process.stdout.write(`${COLORS.gray}[AUDIT STEP]${COLORS.reset} ${title.padEnd(46, '.')} `);
  const stepIssues = [];

  sourceFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const lines = content.split('\n');

    lines.forEach((line, idx) => {
      const trimmed = line.trim();
      // Skip comment lines
      if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return;

      rules.forEach(rule => {
        if (rule.regex.test(line)) {
          stepIssues.push({
            rule: rule.name,
            file: path.relative(ROOT_DIR, file),
            line: idx + 1,
            snippet: trimmed
          });
        }
      });
    });
  });

  if (stepIssues.length === 0) {
    passedCategories++;
    console.log(`${COLORS.green}✅ PASS (+${points}đ)${COLORS.reset}`);
    return true;
  } else {
    console.log(`${COLORS.red}❌ FAIL (0/${points}đ)${COLORS.reset}`);
    stepIssues.forEach(iss => {
      console.log(`         ${COLORS.red}↳ [${iss.rule}] ${iss.file}:${iss.line}${COLORS.reset}`);
      console.log(`           ${COLORS.gray}Code: ${iss.snippet}${COLORS.reset}`);
      issues.push(iss);
    });
    return false;
  }
}

// 1. Anti-Colloquial & Slang (25 pts)
checkCategory('1. Anti-Colloquial & Anti-Slang', 25, [
  {
    name: 'Khẩu ngữ & trợ từ suồng sã',
    regex: /[\x22\x27\x60][^\x22\x27\x60]*\b(nha|nè|nhé\s+ạ|nhen|thoai|rồi\s+nha|thôi\s+nè|luôn\s+nè)\b[^\x22\x27\x60]*[\x22\x27\x60]/i
  },
  {
    name: 'Tiếng lóng buôn bán xe chợ trời',
    regex: /\b(xe cọp|chất xe|xe keng|chuẩn đét|cắt máu|bán tháo|gom xe|ôm xe|hốt xe|múc xe|tiền tươi|ứng nóng|chốt kèo|tiền lót tay|khách sộp|thủng lốp)\b/i
  },
  {
    name: 'Teencode & viết tắt không chính quy',
    regex: /[\x22\x27\x60][^\x22\x27\x60]*\b(ko|thik|ntn)\b[^\x22\x27\x60]*[\x22\x27\x60]/i
  }
]);

// 2. Auto 28 Domain Lexicon SSoT (Kế toán & Kho xe Showroom) (25 pts)
checkCategory('2. Auto 28 Domain Lexicon SSoT', 25, [
  {
    name: 'Tổng sở hữu (Phải dùng Tổng lưu kho / Thời gian lưu kho)',
    regex: /Tổng\s+sở\s+hữu/i
  },
  {
    name: 'Khách nợ / Nợ tiền (Phải dùng Công nợ phải thu / Công nợ còn lại)',
    regex: /khách\s+nợ|nợ\s+tiền\s+chủ\s+xe/i
  },
  {
    name: 'Tổng nợ tiền xe (Phải dùng Tổng công nợ phải trả)',
    regex: /Tổng\s+nợ\s+tiền\s+xe/i
  },
  {
    name: 'Tổng Vốn Đọng (Phải dùng Tổng Giá Trị Tồn Kho)',
    regex: /[\x27\x22\x60]Tổng\s+Vốn\s+Đọng[\x27\x22\x60]/i
  },
  {
    name: 'Giá mua / Tiền mua xe (Phải dùng Giá nhập / Tiền nhập xe)',
    regex: /[\x27\x22\x60]Giá\s+Mua[\x27\x22\x60]|tiền\s+mua\s+xe|giá\s+mua\s+xe/i
  },
  {
    name: 'Lãi gộp / Tỷ suất lãi gộp (Phải dùng Lợi nhuận gộp / Biên lợi nhuận gộp)',
    regex: /\b(Lãi gộp|Tỷ suất lãi gộp)\b/i
  },
  {
    name: 'Lương cứng (Phải dùng Lương cơ bản)',
    regex: /\bLương\s+cứng\b/i
  },
  {
    name: 'Spa xe (Phải dùng Làm đẹp & Hoàn thiện xe)',
    regex: /\b(Spa xe|spa dọn xe)\b/i
  },
  {
    name: 'Công tơ mét / km chạy (Phải dùng Số ODO / Số km đã đi)',
    regex: /công\s+tơ\s+mét|km\s+chạy/i
  },
  {
    name: 'Đời xe / Năm sinh (Phải dùng Năm sản xuất)',
    regex: /đời\s+xe|năm\s+sinh/i
  },
  {
    name: 'Tiền lời / Ăn chênh lệch (Phải dùng Lợi nhuận gộp / Lợi nhuận)',
    regex: /tiền\s+lời|ăn\s+chênh\s+lệch/i
  }
]);

// 3. Actionable UX Writing & Microcopy (25 pts)
checkCategory('3. Actionable UX Writing & Microcopy', 25, [
  {
    name: 'Thông báo lỗi mơ hồ (thiếu [Sự việc] + [Nguyên nhân] + [Hướng giải quyết])',
    regex: /[\x22\x27\x60](Có lỗi xảy ra|Thao tác thất bại|Tải ảnh thất bại|Lỗi mạng|Đã có lỗi)[\x22\x27\x60]/i
  },
  {
    name: 'Nút CTA thiếu động từ dứt khoát (OK, Submit, Click)',
    regex: />(OK|Submit|Click\s+vào\s+đây)</i
  }
]);

// 4. Vietnamese Grammar, Typography & Number Formatting (25 pts)
checkCategory('4. Typography & Casing Governance', 25, [
  {
    name: 'Sai chính tả qui định -> quy định',
    regex: /qui\s*định/i
  },
  {
    name: 'Viết tắt CP thay vì Chi phí trên UI',
    regex: /[\x22\x27\x60][^\x22\x27\x60]*\bCP\s+vận\s+hành\b[^\x22\x27\x60]*[\x22\x27\x60]/i
  }
]);

// Final Score
console.log(`\n${COLORS.cyan}──────────────────────────────────────────────────────────────────${COLORS.reset}`);
const finalScore = Math.round((passedCategories / totalCategories) * 100);

if (finalScore === 100) {
  console.log(`${COLORS.green}${COLORS.bright}🏆 KẾT QUẢ: 100/100 ĐIỂM — TOÀN BỘ NGÔN NGỮ ĐẠT CHUẨN DOANH NGHIỆP!${COLORS.reset}\n`);
  process.exit(0);
} else {
  console.log(`${COLORS.yellow}${COLORS.bright}⚠️  KẾT QUẢ: ${finalScore}/100 ĐIỂM — CÓ ${issues.length} LỖI NGÔN NGỮ CẦN SỬA!${COLORS.reset}\n`);
  process.exit(1);
}
