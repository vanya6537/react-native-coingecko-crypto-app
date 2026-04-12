cmake_minimum_required(VERSION 3.13)
project(cryptotokensapp)

# Minimal CMakeLists for React Native app without native modules
# This is a placeholder for future native code

# Create empty library
file(WRITE "${CMAKE_BINARY_DIR}/empty.cpp" "")
add_library(appmodules STATIC "${CMAKE_BINARY_DIR}/empty.cpp")

