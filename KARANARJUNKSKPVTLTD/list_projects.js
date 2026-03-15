const { execSync } = require('child_process');
const fs = require('fs');
try {
    const output = execSync('npx firebase projects:list --json', { encoding: 'utf-8' });
    fs.writeFileSync('projects.json', output);
} catch (e) {
    console.error(e.message);
}
