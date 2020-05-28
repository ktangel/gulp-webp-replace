'use strict';
const path = require('path');
const through = require('through2');
const PLUGIN_NAME = 'gulp-webp-replace';
const trumpet = require("trumpet");
const concat = require("concat-stream");
let webpFilePathMap = {};

function generate() {
    return through.obj((file, enc, cb) => {
        let isSupported = file.extname.toLowerCase() === '\.webp';
        if (file.isNull() || !isSupported) return cb(null, file);
        if (file.isStream()) return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'), file);
        if (file.history.length > 1) {
            let originalPath, webpPath, originalFileName, webpFileName, basePath, hasWebp;
            file.history.forEach(function (paths, inx) {
                if (paths.match(/\.webp$/)) {
                    originalPath = file.history[inx - 1].replace(/\\/gi, "\/");
                    webpPath = file.history[inx].replace(/\\/gi, "\/");
                    hasWebp = true;
                    return false;
                }
            });
            if (!hasWebp) return cb(null, file);
            originalFileName = path.relative(file.cwd, originalPath).replace(/\\/gi, "\/");
            webpFileName = path.relative(file.cwd, webpPath).replace(/\\/gi, "\/");
            // basePath = path.relative(file.cwd, file.base).replace(/\\/gi, "\/");;
            webpFilePathMap[originalFileName] = webpFileName;
            // console.log(originalFileName, basePath)
        }
        cb(null, file);
    }, function (cb) {
        cb();
    });
}

function _replaceHtml(attr, base) {
    return function (node) {
        node.getAttribute(attr, function (uri) {
            // uri = url.parse(uri, false, true);
            let basePath = path.join(base, uri).replace(/\\/gi, "\/");
            console.log(uri, basePath);
            if (webpFilePathMap.hasOwnProperty(basePath)) {
                uri = uri.replace(path.basename(basePath), path.basename(webpFilePathMap[basePath]));
            }
            node.setAttribute(attr, uri);

        });
    };
}

generate.collector = function (selector) {
    const cssUrlReg = /url\((.*?)\)/ig;
    return through.obj((file, enc, cb) => {
        if (file.isNull()) return cb(null, file);
        if (file.isStream()) return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'), file);
        let extname = file.extname.toLocaleLowerCase();
        let contents = file.contents.toString('utf8');
        let base = path.relative(file.cwd, file.base).replace(/\\/gi, "\/");
        if (extname === ".css") {
            let manifest = Object.assign({}, webpFilePathMap);
            contents = contents.replace(cssUrlReg, function (match, uri) {
                let basePath = path.join(base, uri).replace(/\\/gi, "\/"), result;
                result = match;
                if (manifest.hasOwnProperty(basePath)) {
                    result = match.replace(path.basename(basePath), path.basename(manifest[basePath]));
                }
                return result;
            });
            file.contents = new Buffer.from(contents);
            return cb(null, file);
        } else if (extname === ".html" || extname === ".htm") {
            let selectors = (selector && Array.isArray(selector)) || [
                { match: "img[src]", attr: "src" },
                { match: "input[src]", attr: "src" },
                { match: "video[poster]", attr: "poster" },
                { match: "img[data-ng-src]", attr: "data-ng-src" }
            ];
            let tr = trumpet();
            for (let selector of selectors) {
                tr.selectAll(selector.match, _replaceHtml(selector.attr, base))
            }

            tr.pipe(concat(function (data) {
                if (Array.isArray(data) && data.length === 0) data = null;
                file.contents = data;
                cb(null, file);
            }));
            tr.end(file.contents);
        }

    }, function (cb) {
        cb()
    });
};


module.exports = generate;