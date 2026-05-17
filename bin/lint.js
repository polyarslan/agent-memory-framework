#!/usr/bin/env node
/**
 * Agent Memory Lint Tool
 * Check dead links, stale info, and calculate health score
 */

const fs = require('fs');
const path = require('path');

// Default config
const DEFAULT_ROOT = process.cwd();
const DEFAULT_DIRS = ['01-原则', '02-skills', '03-projects', '04-raw', '05-tools'];
const DEFAULT_FILES = ['00-索引.md', '03-项目进展.md'];
const DEFAULT_WHITELIST = ['总结', '审核', '归档'];

/**
 * Parse command line args
 */
function parseArgs() {
  const args = process.argv.slice(2);
  return {
    fix: args.includes('--fix'),
    root: args.find(a => a.startsWith('--root='))?.split('=')[1] || DEFAULT_ROOT,
    verbose: args.includes('--verbose') || args.includes('-v')
  };
}

/**
 * Load config from file or use defaults
 */
function loadConfig(root) {
  const configPath = path.join(root, 'memory-lint.config.json');
  if (fs.existsSync(configPath)) {
    try {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.log('⚠️  Config file invalid, using defaults');
    }
  }
  return {
    root: root,
    dirs: DEFAULT_DIRS,
    files: DEFAULT_FILES,
    whitelist: DEFAULT_WHITELIST
  };
}

/**
 * Check if link is in code block
 */
function isInCodeBlock(content, position) {
  const preceding = content.substring(Math.max(0, position - 500), position);
  const codeBlockMarkers = (preceding.match(/```/g) || []).length;
  return codeBlockMarkers % 2 === 1;
}

/**
 * Check if link is in inline code
 */
function isInInlineCode(content, position) {
  const preceding = content.substring(Math.max(0, position - 100), position);
  const following = content.substring(position, Math.min(content.length, position + 100));
  const precedingBackticks = (preceding.match(/(?<!`)`(?!`)/g) || []).length;
  return precedingBackticks % 2 === 1;
}

/**
 * Extract wikilinks from content
 */
function extractWikilinks(content) {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links = [];
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const link = match[1];
    const position = match.index;
    
    // Filter: code blocks
    if (isInCodeBlock(content, position)) continue;
    if (isInInlineCode(content, position)) continue;
    
    // Filter: false positives
    const filters = [
      link.includes(','),
      link.includes('"'),
      link.includes("'"),
      link.includes('('),
      link.includes('['),
      link.includes('{'),
      link.includes('$'),
      link.includes('=='),
      link.includes('!='),
      link.includes(' '),
      link.length < 3,
      link.length > 50,
      /^\d+$/.test(link),
      link.startsWith('_'),
      link.startsWith('http'),
      // Common code keywords
      ['Project', 'List', 'Dict', 'Class', 'String', 'File'].includes(link)
    ];
    
    if (filters.some(f => f)) continue;
    
    const cleanLink = link.split('#')[0].split('|')[0].trim();
    if (/^[a-zA-Z0-9_\-\u4e00-\u9fa5]+$/.test(cleanLink)) {
      links.push(cleanLink);
    }
  }
  
  return links;
}

/**
 * Get all markdown files
 */
function getAllMarkdownFiles(dir, files = [], whitelist = []) {
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      getAllMarkdownFiles(fullPath, files, whitelist);
    } else if (entry.name.endsWith('.md')) {
      const baseName = path.basename(entry.name, '.md');
      if (!whitelist.some(w => baseName.includes(w))) {
        files.push(fullPath);
      }
    }
  }
  
  return files;
}

/**
 * Check dead links
 */
function checkDeadLinks(config) {
  const deadLinks = [];
  const root = config.root;
  
  // Collect existing files
  const existingFiles = new Set();
  for (const dir of config.dirs) {
    const files = getAllMarkdownFiles(path.join(root, dir), [], config.whitelist);
    files.forEach(f => existingFiles.add(path.basename(f, '.md')));
  }
  
  // Check each file
  const allFiles = [...config.files.map(f => path.join(root, f))];
  for (const dir of config.dirs) {
    const files = getAllMarkdownFiles(path.join(root, dir), [], config.whitelist);
    allFiles.push(...files);
  }
  
  for (const file of allFiles) {
    if (!fs.existsSync(file)) continue;
    
    const content = fs.readFileSync(file, 'utf-8');
    const links = extractWikilinks(content);
    
    for (const link of links) {
      if (!existingFiles.has(link)) {
        deadLinks.push({
          file: path.basename(file),
          path: file,
          link: link
        });
      }
    }
  }
  
  return deadLinks;
}

/**
 * Fix dead links
 */
function fixDeadLinks(deadLinks) {
  const fixed = { files: 0, links: 0 };
  const fileGroups = {};
  
  // Group by file
  for (const d of deadLinks) {
    if (!fileGroups[d.path]) fileGroups[d.path] = [];
    fileGroups[d.path].push(d.link);
  }
  
  // Fix each file
  for (const [filePath, links] of Object.entries(fileGroups)) {
    if (!fs.existsSync(filePath)) continue;
    
    let content = fs.readFileSync(filePath, 'utf-8');
    let modified = false;
    
    for (const link of links) {
      const pattern = new RegExp(`\\[\\[${link}\\]\\]`, 'g');
      if (pattern.test(content)) {
        content = content.replace(pattern, link);
        modified = true;
        fixed.links++;
      }
    }
    
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf-8');
      fixed.files++;
      console.log(`  ✅ Fixed: ${path.basename(filePath)} (${links.length} links)`);
    }
  }
  
  return fixed;
}

/**
 * Calculate health score
 */
function calculateHealthScore(deadLinks) {
  let score = 100;
  score -= deadLinks.length * 5;
  return Math.max(0, score);
}

/**
 * Main
 */
function main() {
  const args = parseArgs();
  const config = loadConfig(args.root);
  
  console.log('\n🔍 Agent Memory Lint Check\n');
  console.log('═'.repeat(50));
  console.log(`📁 Root: ${config.root}`);
  
  const deadLinks = checkDeadLinks(config);
  const healthScore = calculateHealthScore(deadLinks);
  
  console.log(`\n📊 Health Score: ${healthScore}/100\n`);
  
  if (deadLinks.length > 0) {
    console.log(`❌ Dead Links (${deadLinks.length}):`);
    deadLinks.forEach(d => {
      console.log(`  - [[${d.link}]] in ${d.file}`);
    });
    console.log('');
    
    if (args.fix) {
      console.log('\n🔧 Auto-fixing...\n');
      const fixed = fixDeadLinks(deadLinks);
      console.log(`\n✨ Fixed: ${fixed.files} files, ${fixed.links} links\n`);
      
      // Re-check
      const newDeadLinks = checkDeadLinks(config);
      const newScore = calculateHealthScore(newDeadLinks);
      console.log(`📊 After fix: ${newScore}/100\n`);
    } else {
      console.log('💡 Tip: Use --fix to auto-repair dead links\n');
    }
  } else {
    console.log('✅ Memory system healthy, no issues found!\n');
  }
  
  console.log('═'.repeat(50));
  console.log(`Check completed: ${new Date().toLocaleString()}\n`);
}

main();