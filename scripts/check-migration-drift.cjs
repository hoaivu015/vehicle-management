const fs = require('fs');
const path = require('path');

const typesPath = path.join(__dirname, '../src/shared/domain/types.ts');
const dbTypesPath = path.join(__dirname, '../src/shared/infrastructure/database.types.ts');

function logSuccess(message) {
  console.log(`\x1b[32m✔ ${message}\x1b[0m`);
}

function logError(message) {
  console.error(`\x1b[31m✘ ${message}\x1b[0m`);
}

function logWarning(message) {
  console.warn(`\x1b[33m⚠ ${message}\x1b[0m`);
}

try {
  console.log("🔍 Đang bắt đầu kiểm tra lệch pha dữ liệu (Database Migration Drift Check)...");

  if (!fs.existsSync(typesPath) || !fs.existsSync(dbTypesPath)) {
    logError("Không tìm thấy tệp types.ts hoặc database.types.ts!");
    process.exit(1);
  }

  const typesContent = fs.readFileSync(typesPath, 'utf8');
  const dbTypesContent = fs.readFileSync(dbTypesPath, 'utf8');

  // 1. Trích xuất các trường từ interface Vehicle trong types.ts
  const vehicleRegex = /export interface Vehicle \{([\s\S]*?)\n\}/;
  const vehicleMatch = typesContent.match(vehicleRegex);
  if (!vehicleMatch) {
    logError("Không thể tìm thấy interface Vehicle trong types.ts!");
    process.exit(1);
  }

  const vehicleFields = new Set();
  const vehicleLines = vehicleMatch[1].split('\n');
  for (const line of vehicleLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('//') && !trimmed.startsWith('/*')) {
      const match = trimmed.match(/^([a-zA-Z0-9_]+)\??\s*:/);
      if (match && match[1]) {
        // Bỏ qua các trường ảo không lưu trong DB (như cost_history, history, notes, etc. là json hoặc computed)
        const fieldName = match[1];
        if (!['cost_history', 'purchase_payment_history', 'sale_payment_history', 'history', 'license_plate', 'images'].includes(fieldName)) {
          vehicleFields.add(fieldName);
        }
      }
    }
  }

  // 2. Trích xuất các trường từ vehicles.Row trong database.types.ts
  const dbVehicleRegex = /vehicles:\s*\{\s*Row:\s*\{([\s\S]*?)\n\s*\}/;
  const dbVehicleMatch = dbTypesContent.match(dbVehicleRegex);
  if (!dbVehicleMatch) {
    logError("Không thể tìm thấy vehicles.Row trong database.types.ts!");
    process.exit(1);
  }

  const dbVehicleFields = new Set();
  const dbVehicleLines = dbVehicleMatch[1].split('\n');
  for (const line of dbVehicleLines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('//')) {
      const match = trimmed.match(/^([a-zA-Z0-9_]+)\??\s*:/);
      if (match && match[1]) {
        dbVehicleFields.add(match[1]);
      }
    }
  }

  // 3. So sánh
  const missingInDb = [];
  for (const field of vehicleFields) {
    // Một số trường đặc thù có thể được Map hoặc Computed
    if (!dbVehicleFields.has(field) && !['expected_profit', 'days'].includes(field)) {
      missingInDb.push(field);
    }
  }

  if (missingInDb.length > 0) {
    logError(`PHÁT HIỆN LỆCH PHA SCHEMA (MIGRATION DRIFT)!`);
    console.error(`Các trường sau được khai báo trong Domain Vehicle Type nhưng thiếu trong Database Schema:`);
    for (const field of missingInDb) {
      console.error(`  - \x1b[31m${field}\x1b[0m`);
    }
    console.error(`\x1b[33m👉 Vui lòng cập nhật SQL Migration trên Supabase trước khi cập nhật types.ts!\x1b[0m`);
    process.exit(1);
  }

  logSuccess("Domain Vehicle Type hoàn toàn đồng bộ với Database Schema. Zero migration drift detected.");
  process.exit(0);

} catch (error) {
  logError(`Lỗi khi chạy script check: ${error.message}`);
  process.exit(1);
}
