import fs from 'fs';
import path from 'path';
import { chromium } from 'playwright';

const DIRS = ['./src/components/landing', './src/app/(public)'];
const CURRENT = {
  bgLight: '#F9F9F8',
  bgDark: '#18181B',
  accentPrimary: '#D47151',
  accentSecondary: '#2B3B44',
  cardDark: '#27272A',
  bgSoft: '#F4F4F5'
};

const PALETTES = [
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
filesToUpdate.push('./src/app/globals.css', './src/app/layout.tsx');

const originalContents = new Map();
filesToUpdate.forEach(f => {
  originalContents.set(f, fs.readFileSync(f, 'utf8'));
});

async function run() {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 1080 }); // Solo la vista principal

  for (const p of PALETTES) {
    console.log(`Aplicando paleta: ${p.name}`);
    for (const f of filesToUpdate) {
      let content = originalContents.get(f);
      content = content.replace(new RegExp(CURRENT.bgLight, 'gi'), p.bgLight);
      content = content.replace(new RegExp(CURRENT.bgDark, 'gi'), p.bgDark);
      content = content.replace(new RegExp(CURRENT.accentPrimary, 'gi'), p.accentPrimary);
      content = content.replace(new RegExp(CURRENT.accentSecondary, 'gi'), p.accentSecondary);
      content = content.replace(new RegExp(CURRENT.cardDark, 'gi'), p.cardDark);
      content = content.replace(new RegExp(CURRENT.bgSoft, 'gi'), p.bgSoft);
      fs.writeFileSync(f, content, 'utf8');
    }

    console.log('Esperando compilación de Next.js (5s)...');
    await new Promise(r => setTimeout(r, 5000));

    try {
      await page.goto('http://localhost:3000', { waitUntil: 'load', timeout: 15000 });
      await page.reload({ waitUntil: 'load', timeout: 15000 });
    } catch(e) {}
    
    await page.waitForTimeout(2000); 
    
    const screenshotPath = `C:/Users/cefd2/.gemini/antigravity/brain/87e1b5a8-0840-424d-8c6f-b7eabc4c3a37/${p.name}.png`;
    try {
      await page.screenshot({ path: screenshotPath, timeout: 5000, animations: 'disabled' });
      console.log('Captura guardada:', screenshotPath);
    } catch (e) {
      console.log('screenshot error:', e.message);
    }
  }

  await browser.close();

  console.log('Restaurando archivos originales...');
  for (const f of filesToUpdate) {
    fs.writeFileSync(f, originalContents.get(f), 'utf8');
  }
}

run().catch(console.error);
