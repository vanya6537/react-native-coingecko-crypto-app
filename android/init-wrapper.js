#!/usr/bin/env node
/**
 * Initialize Gradle wrapper JAR if missing.
 * This script ensures gradle-wrapper.jar exists before gradle build.
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const wrapperJarPath = path.join(__dirname, 'gradle', 'wrapper', 'gradle-wrapper.jar');
const wrapperPropsPath = path.join(__dirname, 'gradle', 'wrapper', 'gradle-wrapper.properties');

// Check if JAR already exists
if (fs.existsSync(wrapperJarPath)) {
  console.log('✓ Gradle wrapper JAR already exists');
  process.exit(0);
}

// Read wrapper.properties to get Gradle version
let gradleVersion = '8.11.1';
try {
  const props = fs.readFileSync(wrapperPropsPath, 'utf-8');
  const match = props.match(/gradle-(\d+\.\d+(?:\.\d+)?)/);
  if (match) {
    gradleVersion = match[1];
  }
} catch (e) {
  console.warn('Could not read wrapper properties, using default version:', gradleVersion);
}

console.log(`Downloading Gradle wrapper JAR for version ${gradleVersion}...`);

// Standard Gradle wrapper JAR location
const url = `https://services.gradle.org/distributions/gradle-wrapper-${gradleVersion}.jar`;

const file = fs.createWriteStream(wrapperJarPath);
https.get(url, (response) => {
  if (response.statusCode === 200) {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log('✓ Gradle wrapper JAR downloaded successfully');
      process.exit(0);
    });
  } else {
    console.error(`Failed to download wrapper: HTTP ${response.statusCode}`);
    fs.unlink(wrapperJarPath, () => {});
    process.exit(1);
  }
}).on('error', (err) => {
  console.error('Download error:', err.message);
  fs.unlink(wrapperJarPath, () => {});
  process.exit(1);
});
