#!/usr/bin/env ruby

require 'xcodeproj'

# Create a new Xcode project
project_path = 'CryptoTokensApp/CryptoTokensApp.xcodeproj'
project = Xcodeproj::Project.new(project_path)

# Create a main group
main_group = project.new_group('CryptoTokensApp')

# Add source files to the group
app_delegate_file = main_group.new_file('../CryptoTokensApp/AppDelegate.h')
main_file = main_group.new_file('../CryptoTokensApp/main.m')

# Create a simple app target
target = project.new_target(:application, 'CryptoTokensApp', :ios, '12.0')

# Add source files to the target's compile sources build phase
target.add_file_references([main_file])

# Create a test target
test_target = project.new_target(:unit_test_bundle, 'CryptoTokensAppTests', :ios, '12.0')
test_target.add_dependency(target)

# Add build settings to app target
target.build_configuration_list.build_configurations.each do |config|
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
  config.build_settings['CODE_SIGN_IDENTITY'] = '-'
  config.build_settings['CODE_SIGN_STYLE'] = 'Automatic'
  config.build_settings['DEVELOPMENT_TEAM'] = ''
  config.build_settings['SDKROOT'] = 'iphoneos'
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
  config.build_settings['INFOPLIST_FILE'] = '../CryptoTokensApp/Info.plist'
  config.build_settings['PRODUCT_NAME'] = 'CryptoTokensApp'
  config.build_settings['EXECUTABLE_NAME'] = 'CryptoTokensApp'
  config.build_settings['PRODUCT_BUNDLE_IDENTIFIER'] = 'com.cryptotokens.app'
  config.build_settings['HEADER_SEARCH_PATHS'] = '$(inherited) $(PODS_ROOT)/React/React $(PODS_ROOT)/React-Core $(PODS_ROOT)/React-Common $(PODS_ROOT)/React-RCTNetwork $(PODS_ROOT)/React-RCTAnimation $(PODS_ROOT)/React-RCTBlob $(PODS_ROOT)/React-RCTImage $(PODS_ROOT)/React-RCTLinking $(PODS_ROOT)/React-RCTSettings $(PODS_ROOT)/React-RCTText $(PODS_ROOT)/React-RCTVibration $(PODS_ROOT)/React-RCTActionSheetIOS $(PODS_ROOT)/ReactCommon $(PODS_ROOT)/react-native-mmkv'
  config.build_settings['LIBRARY_SEARCH_PATHS'] = '$(inherited) $(PODS_ROOT)/React'
  config.build_settings['FRAMEWORK_SEARCH_PATHS'] = '$(inherited) $(PODS_CONFIGURATION_BUILD_DIR)'
end

# Add build settings to test target
test_target.build_configuration_list.build_configurations.each do |config|
  config.build_settings['IPHONEOS_DEPLOYMENT_TARGET'] = '12.0'
  config.build_settings['CODE_SIGN_IDENTITY'] = '-'
  config.build_settings['CODE_SIGN_STYLE'] = 'Automatic'
  config.build_settings['DEVELOPMENT_TEAM'] = ''
  config.build_settings['SDKROOT'] = 'iphoneos'
  config.build_settings['TARGETED_DEVICE_FAMILY'] = '1,2'
  config.build_settings['TEST_TARGET_NAME'] = 'CryptoTokensApp'
end

# Save the project
project.save

puts "✓ Xcode project created at: #{project_path}"
