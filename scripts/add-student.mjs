#!/usr/bin/env node
/**
 * 학생 등록 CLI 스크립트.
 *
 * Step 6 관리자 UI 완성 전까지는 이 스크립트로 학생을 등록합니다.
 *
 * 사용법:
 *   node scripts/add-student.mjs "홍길동" 120331 01012345678 "중2, 수학 강함"
 *
 * 인자:
 *   1. 학생 이름
 *   2. 생년월일 6자리 (YYMMDD)
 *   3. 학부모 전화번호 (하이픈 유무 무관)
 *   4. 메모 (선택)
 *
 * ⚠️ 이 스크립트는 SUPABASE_SERVICE_ROLE_KEY 를 사용합니다.
 *    로컬에서만 실행. 배포 서버에서 실행하지 말 것.
 */

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

// .env.local 수동 로드 (dotenv 미설치 환경 대응)
try {
  const envPath = resolve(process.cwd(), '.env.local');
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // 따옴표 제거
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!process.env[key]) process.env[key] = value;
  }
} catch (err) {
  console.warn('⚠️  .env.local 을 읽을 수 없습니다. 환경변수가 직접 설정되어 있는지 확인하세요.');
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 가 설정되지 않았습니다.');
  process.exit(1);
}

const [, , name, birthdate, rawPhone, note] = process.argv;

if (!name || !birthdate || !rawPhone) {
  console.error('사용법: node scripts/add-student.mjs "이름" 120331 01012345678 "메모(선택)"');
  process.exit(1);
}

// 검증
if (!/^\d{6}$/.test(birthdate)) {
  console.error('❌ 생년월일은 숫자 6자리여야 합니다. 예: 120331');
  process.exit(1);
}

const digits = rawPhone.replace(/\D/g, '');
if (!/^010\d{8}$/.test(digits)) {
  console.error('❌ 전화번호는 010으로 시작하는 11자리여야 합니다.');
  process.exit(1);
}
const parent_phone = `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

console.log('\n학생 등록 정보:');
console.log(`  이름:     ${name}`);
console.log(`  생년월일: ${birthdate} → bcrypt 해시 저장`);
console.log(`  전화번호: ${parent_phone}`);
if (note) console.log(`  메모:     ${note}`);
console.log();

const birthdate_hash = await bcrypt.hash(birthdate, 10);

const { data, error } = await supabase
  .from('students')
  .insert({
    name,
    birthdate_hash,
    parent_phone,
    profile_note: note ?? null,
  })
  .select('id, name, parent_phone, created_at')
  .single();

if (error) {
  if (error.code === '23505') {
    console.error('❌ 이미 등록된 학생입니다. (이름 + 전화번호 중복)');
  } else {
    console.error('❌ 등록 실패:', error.message);
  }
  process.exit(1);
}

console.log('✅ 등록 완료!');
console.log(`  ID: ${data.id}`);
console.log(`  생성: ${data.created_at}`);
console.log();
console.log(`이제 학생이 "${name}" + "${birthdate}" 로 로그인할 수 있습니다.\n`);
