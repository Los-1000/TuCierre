import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { chromium } from 'playwright';

const DIRS = ['./src/components/landing', './src/app/(public)'];
const ORIGINAL = {
  bgLight: '#FFFEF5',
  bgDark: '#12161F',
  accentPrimary: '#C9880E',
  accentSecondary: '#1B5E4B',
  cardDark: '#1C1C1E',
  bgSoft: '#FAFAF8'
};

const PALETTES = [
  {
    name: '1_Original',
    ...ORIGINAL
  },
  {
    name: '2_Obsidian_Copper',
    bgLight: '#F9F9F8',
    bgDark: '#18181B',
    accentPrimary: '#D47151',
    accentSecondary: '#2B3B44',
    cardDark: '#27272A',
    bgSoft: '#F4F4F5'
  },
  {
    name: '3_Nordic_Fintech',
    bgLight: '#F8FAFC',
    bgDark: '#0B1120',
    accentPrimary: '#4F46E5',
    accentSecondary: '#0EA5E9',
    cardDark: '#1E293B',
    bgSoft: '#F1F5F9'
  },
  {
    name: '4_Earthy_Trust',
    bgLight: '#FAFAF8',
    bgDark: '#241E1A',
    accentPrimary: '#C66B49',
    accentSecondary: '#738166',
    cardDark: '#362E29',
    bgSoft: '#F5F5F0'
  },
  {
    name: '5_Royal_Sapphire',
    bgLight: '#FCFCFD',
    bgDark: '#030712',
    accentPrimary: '#2563EB',
    accentSecondary: '#6366F1',
    cardDark: '#111827',
    bgSoft: '#F9FAFB'
  }
];

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);
  arrayOfFiles = arrayOfFiles || [];
  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else if (file.endsWith('.tsx') || file.endsWith('.css')) {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });
  return arrayOfFiles;
}

const filesToUpdate = [];
DIRS.forEach(d => getAllFiles(d, filesToUpdate));
filesToUpdate.push('./src/app/globals.css');

const originalContents = new Map();
filesToUpdate.forEach(f => {
  originalContents.set(f, fs.readFileSync(f, 'utf8'));
});

async function run() {
  console.log('Iniciando navegador...');
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  for (const p of PALETTES) {
    console.log(`Aplicando paleta: ${p.name}`);
    for (const f of filesToUpdate) {
      let content = originalContents.get(f);
      content = content.replace(new RegExp(ORIGINAL.bgLight, 'gi'), p.bgLight);
      content = content.replace(new RegExp(ORIGINAL.bgDark, 'gi'), p.bgDark);
      content = content.replace(new RegExp(ORIGINAL.accentPrimary, 'gi'), p.accentPrimary);
      content = content.replace(new RegExp(ORIGINAL.accentSecondary, 'gi'), p.accentSecondary);
      content = content.replace(new RegExp(ORIGINAL.cardDark, 'gi'), p.cardDark);
      content = content.replace(new RegExp(ORIGINAL.bgSoft, 'gi'), p.bgSoft);
      fs.writeFileSync(f, content, 'utf8');
    }

    console.log('Esperando compilación de Next.js (5s)...');
    await new Promise(r => setTimeout(r, 5000));

    console.log(`Tomando captura de ${p.name}...`);
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    
    const screenshotPath = `C:/Users/cefd2/.gemini/antigravity/brain/87e1b5a8-0840-424d-8c6f-b7eabc4c3a37/${p.name}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Captura guardada:', screenshotPath);
  }

  await browser.close();

  console.log('Restaurando archivos originales...');
  for (const f of filesToUpdate) {
    fs.writeFileSync(f, originalContents.get(f), 'utf8');
  }
  console.log('Proceso terminado.');
}

run().catch(console.error);
