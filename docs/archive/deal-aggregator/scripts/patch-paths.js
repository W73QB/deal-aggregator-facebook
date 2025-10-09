const fs = require('fs');
const path = require('path');

// Define the HTML files directory
const htmlDir = path.join(__dirname, '../platforms/website/pages');

// Get all HTML files
const htmlFiles = fs.readdirSync(htmlDir).filter(file => file.endsWith('.html'));

console.log(`Found ${htmlFiles.length} HTML files to patch...`);

htmlFiles.forEach(file => {
  const filePath = path.join(htmlDir, file);
  console.log(`Processing: ${file}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Update CSS references
  content = content.replace(/href="styles\.css"/g, 'href="../css/styles.css"');
  content = content.replace(/href="blog\.css"/g, 'href="../css/blog.css"');
  
  // Update JS references
  content = content.replace(/src="script\.js"/g, 'src="../js/script.js"');
  content = content.replace(/src="blog\.js"/g, 'src="../js/blog.js"');
  
  // Update asset references
  content = content.replace(/src="logo-concept\.svg"/g, 'src="../assets/logo-concept.svg"');
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✓ Patched ${file}`);
});

console.log("All HTML asset paths have been updated successfully!");