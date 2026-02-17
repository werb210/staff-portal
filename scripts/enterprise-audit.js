import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const results = {
  eslint: { status: 'not_run', errors: 0, warnings: 0 },
  typecheck: { status: 'skipped', errors: 0 },
  audit: { status: 'not_run', critical: 0, high: 0, moderate: 0, low: 0 },
  depcheck: { status: 'not_run', dependencies: [], devDependencies: [] },
  circular: { status: 'not_run', cycles: [] },
  build: { status: 'skipped' },
  bundle: { status: 'skipped', totalBytes: 0, files: [] },
};

function section(title) {
  console.log(`\n--- ${title} ---`);
}

function runCommand(command, options = {}) {
  try {
    const output = execSync(command, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
      ...options,
    });
    return { ok: true, output };
  } catch (error) {
    const stdout = error?.stdout?.toString?.() ?? '';
    const stderr = error?.stderr?.toString?.() ?? '';
    return { ok: false, output: `${stdout}${stderr}`.trim() };
  }
}

function parseEslintCounts(text) {
  const match = text.match(/(\d+)\s+errors?,\s+(\d+)\s+warnings?/i);
  if (match) {
    return { errors: Number(match[1]), warnings: Number(match[2]) };
  }
  const fallbackErrors = (text.match(/\berror\b/gi) || []).length;
  const fallbackWarnings = (text.match(/\bwarning\b/gi) || []).length;
  return { errors: fallbackErrors, warnings: fallbackWarnings };
}

function directorySize(targetDir) {
  let total = 0;
  const files = [];

  if (!fs.existsSync(targetDir)) {
    return { total, files };
  }

  const stack = [targetDir];
  while (stack.length) {
    const current = stack.pop();
    if (!current) continue;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (entry.isFile()) {
        const size = fs.statSync(fullPath).size;
        total += size;
        files.push({ file: path.relative(process.cwd(), fullPath), size });
      }
    }
  }

  files.sort((a, b) => b.size - a.size);
  return { total, files };
}

function formatBytes(bytes) {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit += 1;
  }
  return `${size.toFixed(2)} ${units[unit]}`;
}

console.log('=== ENTERPRISE REPOSITORY AUDIT ===');

section('CHECK 1: ESLINT');
const eslint = runCommand('npx eslint . --ext .ts,.tsx,.js,.jsx');
const eslintCounts = parseEslintCounts(eslint.output);
results.eslint = {
  status: eslint.ok ? 'passed' : 'failed',
  errors: eslintCounts.errors,
  warnings: eslintCounts.warnings,
};
console.log(eslint.ok ? 'ESLint passed.' : 'ESLint failed.');
console.log(`Errors: ${results.eslint.errors}, Warnings: ${results.eslint.warnings}`);
if (!eslint.ok && eslint.output) {
  console.log(eslint.output.slice(0, 4000));
}

section('CHECK 2: TYPESCRIPT STRICT CHECK');
if (fs.existsSync(path.join(process.cwd(), 'tsconfig.json'))) {
  const typecheck = runCommand('npx tsc --noEmit');
  const errorCount = (typecheck.output.match(/error TS\d+:/g) || []).length;
  results.typecheck = {
    status: typecheck.ok ? 'passed' : 'failed',
    errors: errorCount,
  };
  console.log(typecheck.ok ? 'TypeScript check passed.' : 'TypeScript check failed.');
  console.log(`Type errors: ${errorCount}`);
  if (!typecheck.ok && typecheck.output) {
    console.log(typecheck.output.slice(0, 4000));
  }
} else {
  console.log('tsconfig.json not found. Skipping TypeScript strict check.');
}

section('CHECK 3: VULNERABILITY SCAN');
const audit = runCommand('npm audit --json');
try {
  const parsed = JSON.parse(audit.output || '{}');
  const vulnerabilities = parsed?.metadata?.vulnerabilities || {};
  results.audit = {
    status: audit.ok ? 'passed' : 'failed',
    critical: vulnerabilities.critical || 0,
    high: vulnerabilities.high || 0,
    moderate: vulnerabilities.moderate || 0,
    low: vulnerabilities.low || 0,
  };
} catch {
  results.audit.status = 'failed';
}
console.log(`Critical: ${results.audit.critical}`);
console.log(`High: ${results.audit.high}`);
console.log(`Moderate: ${results.audit.moderate}`);
console.log(`Low: ${results.audit.low}`);

section('CHECK 4: UNUSED DEPENDENCIES');
const depcheck = runCommand('npx depcheck --json');
try {
  const parsed = JSON.parse(depcheck.output || '{}');
  results.depcheck = {
    status: depcheck.ok ? 'passed' : 'failed',
    dependencies: parsed.dependencies || [],
    devDependencies: parsed.devDependencies || [],
  };
} catch {
  results.depcheck.status = 'failed';
}
console.log('Unused dependencies:', results.depcheck.dependencies.length ? results.depcheck.dependencies.join(', ') : 'None');
console.log('Unused devDependencies:', results.depcheck.devDependencies.length ? results.depcheck.devDependencies.join(', ') : 'None');

section('CHECK 5: CIRCULAR DEPENDENCIES');
const madge = runCommand('npx madge --circular --json .');
try {
  const parsed = JSON.parse(madge.output || '[]');
  const cycles = Array.isArray(parsed) ? parsed : [];
  results.circular = {
    status: madge.ok ? 'passed' : 'failed',
    cycles,
  };
} catch {
  results.circular.status = 'failed';
}
if (results.circular.cycles.length) {
  console.log('Circular dependency chains found:');
  for (const cycle of results.circular.cycles) {
    console.log(`- ${Array.isArray(cycle) ? cycle.join(' -> ') : String(cycle)}`);
  }
} else {
  console.log('No circular dependencies found.');
}

section('CHECK 6: BUILD VERIFICATION');
const packageJson = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf8'));
if (packageJson?.scripts?.build) {
  const build = runCommand('npm run build');
  results.build.status = build.ok ? 'passed' : 'failed';
  console.log(build.ok ? 'Build succeeded.' : 'Build failed.');
  if (!build.ok && build.output) {
    console.log(build.output.slice(0, 4000));
  }
} else {
  console.log('No build script found. Skipping build verification.');
}

section('CHECK 7: BUNDLE SIZE (Vite)');
const viteConfigExists = ['vite.config.ts', 'vite.config.js', 'vite.config.mjs', 'vite.config.cjs'].some((file) =>
  fs.existsSync(path.join(process.cwd(), file)),
);
if (viteConfigExists) {
  const viteBuild = runCommand('npx vite build --mode production');
  results.bundle.status = viteBuild.ok ? 'passed' : 'failed';
  if (viteBuild.ok) {
    const distInfo = directorySize(path.join(process.cwd(), 'dist'));
    results.bundle.totalBytes = distInfo.total;
    results.bundle.files = distInfo.files.slice(0, 10);
    console.log(`Total dist size: ${formatBytes(distInfo.total)}`);
    for (const file of results.bundle.files) {
      console.log(`- ${file.file}: ${formatBytes(file.size)}`);
    }
  } else {
    console.log('Vite production build failed.');
    if (viteBuild.output) {
      console.log(viteBuild.output.slice(0, 4000));
    }
  }
} else {
  console.log('Vite config not found. Skipping bundle size check.');
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

const vulnPenalty =
  results.audit.critical * 30 +
  results.audit.high * 15 +
  results.audit.moderate * 5 +
  results.audit.low * 1;
const securityScore = clamp(100 - vulnPenalty);

const qualityPenalty =
  results.eslint.errors * 3 +
  results.eslint.warnings * 1 +
  results.typecheck.errors * 4 +
  results.circular.cycles.length * 10;
const codeQualityScore = clamp(100 - qualityPenalty);

const dependencyPenalty =
  results.depcheck.dependencies.length * 5 +
  results.depcheck.devDependencies.length * 2;
const dependencyHealth = clamp(100 - dependencyPenalty);

const buildStatus =
  results.build.status === 'failed' || results.bundle.status === 'failed' ? 'Failed' : 'Passed';

let overallRisk = 'Low';
if (results.audit.critical > 0 || buildStatus === 'Failed') {
  overallRisk = 'Critical';
} else if (results.audit.high > 0 || securityScore < 60 || codeQualityScore < 60) {
  overallRisk = 'High';
} else if (results.audit.moderate > 0 || securityScore < 80 || dependencyHealth < 70) {
  overallRisk = 'Medium';
}

section('FINAL SUMMARY');
console.log(`Security Score: ${securityScore}/100`);
console.log(`Code Quality Score: ${codeQualityScore}/100`);
console.log(`Dependency Health: ${dependencyHealth}/100`);
console.log(`Build Status: ${buildStatus}`);
console.log(`Overall Risk Level: ${overallRisk}`);
