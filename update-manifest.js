const fs = require('fs');

// Retrieve the version passed as an environment variable
const version = process.env.VERSION;
if (!version) {
    console.error('Error: VERSION environment variable is not set.');
    process.exit(1);
}

const manifestPath = 'manifest.json';

// Read and parse the manifest.json file
let manifest;
try {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
} catch (error) {
    console.error(`Error reading or parsing ${manifestPath}:`, error.message);
    process.exit(1);
}

// Update the start_url field with the new version
manifest.start_url = `/morse-code/?version=${version}`;

// Write the updated manifest.json back to the file
try {
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
    console.log(`Updated start_url to version ${version} in ${manifestPath}`);
} catch (error) {
    console.error(`Error writing to ${manifestPath}:`, error.message);
    process.exit(1);
}
