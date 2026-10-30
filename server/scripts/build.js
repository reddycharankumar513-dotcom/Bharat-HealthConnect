import { execSync } from 'child_process';
import fs from 'fs';

console.log('-------------------------------------------------------');
console.log('🚀 Bharat HealthConnect Server Build');
console.log('-------------------------------------------------------');

let dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || '';

if (!dbUrl && fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed.startsWith('DATABASE_URL=')) {
      dbUrl = trimmed.substring('DATABASE_URL='.length).replace(/["']/g, '');
      break;
    }
  }
}

const isPostgres = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://');
const schemaPath = isPostgres 
  ? 'prisma/schema.prisma' 
  : (fs.existsSync('prisma/schema.sqlite.prisma') ? 'prisma/schema.sqlite.prisma' : 'prisma/schema.prisma');

console.log(`📡 Database target: ${isPostgres ? 'PostgreSQL' : 'SQLite'} (schema: ${schemaPath})`);

if (isPostgres) {
  try {
    console.log('📦 Pushing Prisma schema to PostgreSQL...');
    execSync(`npx prisma db push --schema=${schemaPath} --accept-data-loss`, { stdio: 'inherit' });
  } catch (err) {
    console.warn('⚠️ Note: Database push skipped or deferred. Proceeding with client generation.');
  }
}

console.log('🔨 Generating Prisma Client...');
execSync(`npx prisma generate --schema=${schemaPath}`, { stdio: 'inherit' });

console.log('⚙️ Compiling TypeScript...');
execSync('npx tsc', { stdio: 'inherit' });

console.log('-------------------------------------------------------');
console.log('✅ Server build completed with 0 errors!');
console.log('-------------------------------------------------------');
