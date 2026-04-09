#!/usr/bin/env node

// Polyfill for os.availableParallelism
const Module = require('module');
const originalRequire = Module.prototype.require;

Module.prototype.require = function(id) {
  const module = originalRequire.apply(this, arguments);
  
  if (id === 'os' || id.includes('os')) {
    if (!module.availableParallelism) {
      module.availableParallelism = function () {
        return Math.max(1, module.cpus().length - 1);
      };
    }
  }
  
  return module;
};

// Now run react-native CLI
require('react-native/cli');


