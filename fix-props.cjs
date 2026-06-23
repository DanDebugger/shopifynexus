const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx')) results.push(file);
    }
  });
  return results;
}

const files = walk('./app/routes');

files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  
  // Fix s-text variation
  content = content.replace(/<s-text variation="strong">([\s\S]*?)<\/s-text>/g, '<strong><s-text>$1</s-text></strong>');
  
  // Fix submit button
  content = content.replace(/<s-button submit/g, '<s-button type="submit"');
  
  // Fix marginBlockStart
  content = content.replace(/ marginBlockStart="base"/g, '');
  
  // Fix gap tight
  content = content.replace(/gap="tight"/g, 'gap="base"');
  
  // Fix background critical
  content = content.replace(/background="critical"/g, 'background="subdued"');
  
  // Fix build possibly null
  content = content.replace(/build\.id/g, 'build?.id');
  content = content.replace(/build\.status/g, 'build?.status');
  content = content.replace(/build\.customerId/g, 'build?.customerId');
  content = content.replace(/build\.templateId/g, 'build?.templateId');
  content = content.replace(/build\.totalScore/g, 'build?.totalScore');
  
  // Fix date null
  content = content.replace(/log\.timestamp\)/g, 'log.timestamp!)');

  fs.writeFileSync(f, content);
});
console.log("Fixed JSX props!");
