var ko = require('knockout');
var URI = require('urijs');
var isString = require('lodash/isString');
var isUndefined = require('lodash/isUndefined');

ko.extenders.urlSync = function(target, options) {
    if (isString(options)) {
        options = {
            param: options
        };
    }
    else {
        options = options || {};
    }
    options.read = options.read || function(value) {
        return value;
    };
    options.write = options.write || function(value) {
        return value;
    };

    if (isUndefined(options.param)) return target;

    // retrieve from URI
    var uri = new URI();
    var paramValueQuery = uri.query(true)[options.param];
    if (!isUndefined(paramValueQuery)) {
        var readValue = options.read(paramValueQuery);
        target(readValue);
        uri.setSearch(options.param, options.write(readValue));
        window.history.replaceState({}, "", uri.toString());
    }

    target.subscribe(function(newValue) {
        var uri = new URI();
        var writtenValue = options.write(newValue);
        uri.setSearch(options.param, writtenValue);

        // update hash
        window.history.replaceState({}, "", uri.toString());
    });
    return target;
};