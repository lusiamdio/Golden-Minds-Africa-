import * as fs from 'fs';
import * as path from 'path';

function removeMocks(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      removeMocks(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      let modified = false;
      
      // Simple regex for some exact mock names
      const mocksToReplace = [
        'MOCK_SHOWCASE', 'MOCK_EVENTS', 'MOCK_PARTICIPANTS', 
        'MOCK_TRANSCRIPT', 'MOCK_DATA', 'BADGES', 'MOCK_NODES', 
        'MOCK_LINKS', 'ROOMS', 'MOCK_MENTORS', 'MOCK_MODULES', 
        'MOCK_ROOMS', 'MOCK_RESOURCES', 'MOCK_OPPORTUNITIES', 'MOCK_DEBATE_ROOMS', 'MOCK_COMMUNITIES', 'MOCK_FEED'
      ];
      
      for (const mock of mocksToReplace) {
        const regex = new RegExp(`const ${mock}(\\s*:\\s*any\\[\\]|\\s*:\\s*Room\\[\\])?\\s*=\\s*\\[[\\s\\S]*?\\];`, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, `const ${mock}: any[] = [];`);
          modified = true;
        }
      }
      
      if (modified) {
        fs.writeFileSync(fullPath, content);
        console.log(`Cleared mocks in ${fullPath}`);
      }
    }
  }
}

removeMocks('./src');
