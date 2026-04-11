cmake_minimum_required(VERSION 3.13)
project(cryptotokensapp)

# Minimal CMakeLists - only include core React Native, skip problematic library C++
# Libraries like gesture-handler, reanimated, etc require full New Architecture support

set(REACTNATIVE_SO_DIR ${CMAKE_SOURCE_DIR}/../../build/intermediates/cxx/Debug/6k2q4s8s/obj/arm64-v8a)

# Create empty library if no source files are provided
file(WRITE "${CMAKE_BINARY_DIR}/empty.cpp" "")
add_library(appmodules STATIC "${CMAKE_BINARY_DIR}/empty.cpp")

