#!/bin/bash
# Create iOS Xcode Project Structure for React Native
# Use xcodeproj gem or script to generate project

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
IOS_DIR="$SCRIPT_DIR/ios"  
PROJECT_NAME="CryptoTokensApp"

echo "Creating Xcode project structure for React Native..."
echo ""

# Check if xcodeproj gem is available
if command -v xcodeproj &> /dev/null; then
  echo "Using xcodeproj gem to create project..."
  cd "$IOS_DIR"
  
  xcodeproj create "$PROJECT_NAME/$PROJECT_NAME.xcodeproj"
  
  echo "✓ Xcode project created"
else
  echo "xcodeproj gem not found. Installing..."
  sudo gem install xcodeproj
  
  cd "$IOS_DIR"
  xcodeproj create "$PROJECT_NAME/$PROJECT_NAME.xcodeproj"
  
  echo "✓ Xcode project created"
fi

echo ""
echo "Project path: $IOS_DIR/$PROJECT_NAME/$PROJECT_NAME.xcodeproj"
