/* Module Loader to enable access to private 'vars' inside module scope for testing.
 * Taken from http://howtonode.org/testing-private-state-and-mocking-deps */
'use strict';

var vm = require('vm'),
  fs = require('fs'),
  path = require('path');

/**
 * Helper for unit testing:
 * - load module with mocked dependencies
 * - allow accessing private state of the module
 *
 * @param {string} filePath Absolute path to module (file to load)
 * @param {Object=} mocks Hash of mocked dependencies
 */
exports.loadModule = function(filePath, mocks) {
  mocks = mocks || {};

  // this is necessary to allow relative path modules within loaded file
  // i.e. requiring ./some inside file /a/b.js needs to be resolved to /a/some
  var resolveModule = function(module) {
      if (module.charAt(0) !== '.') {
        return module;
      }
      return path.resolve(path.dirname(filePath), module);
    },
    exports = {},
    context = {
      require: function(name) {
        return mocks[name] || require(resolveModule(name));
      },
      console: console,
      setTimeout: setTimeout,
      exports: exports,
      module: {
        exports: exports
      }
    };

  vm.runInNewContext(fs.readFileSync(filePath), context);
  return context;
};
