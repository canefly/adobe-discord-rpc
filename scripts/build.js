/**
 * Build and Bundle Injection Script
 * Compiles JSX/ESM in src/ and updates client-dist/bundle.js and rpc_client-dist/bundle.js
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const CLIENT_MAP = {
    'react': './node_modules/react/index.js',
    'react-dom': './node_modules/react-dom/index.js',
    'react-dom/client': './node_modules/react-dom/client.js',
    'react-icons/fa': './node_modules/react-icons/fa/index.esm.js',
    'react-icons/vsc': './node_modules/react-icons/vsc/index.esm.js',
    'console-feed': './node_modules/console-feed/lib/index.js',
    'lodash/isEqual': './node_modules/lodash/isEqual.js',
    'lodash/clone': './node_modules/lodash/clone.js'
};

const RPC_MAP = {
    './rpc': './src/rpc_client-src/rpc.js',
    './client.js': './src/rpc_client-src/client.js',
    './localstorage': './src/rpc_client-src/localstorage.js',
    'lodash/isEqual': './node_modules/lodash/isEqual.js',
    'lodash/clone': './node_modules/lodash/clone.js',
    'discord-rpc': './src/rpc_client-src/node_modules/discord-rpc/src/index.js'
};

function replaceModuleInBundle(bundleContent, moduleKey, newModuleBlock) {
    const searchHeader = `/***/ "${moduleKey}":`;
    const startIdx = bundleContent.indexOf(searchHeader);
    if (startIdx === -1) {
        throw new Error(`Module ${moduleKey} not found in bundle!`);
    }

    const nextModuleIdx = bundleContent.indexOf('\n/***/ "', startIdx + searchHeader.length);
    if (nextModuleIdx === -1) {
        throw new Error(`Cannot find end of module ${moduleKey}!`);
    }

    const before = bundleContent.slice(0, startIdx);
    const after = bundleContent.slice(nextModuleIdx);

    return before + newModuleBlock + after;
}

function compileClientModule(srcRelPath, moduleKey, allKeys) {
    console.log(`Compiling client module: ${srcRelPath} -> ${moduleKey}`);
    const rawCompiled = execSync(`npx esbuild "${srcRelPath}" --format=cjs`, { encoding: 'utf8' });
    const moduleDir = path.posix.dirname(moduleKey);

    const requireInterceptor = `
var require = function(id) {
    var fixedMap = ${JSON.stringify(CLIENT_MAP)};
    if (fixedMap[id]) return __webpack_require__(fixedMap[id]);

    if (id.startsWith('.')) {
        var baseDir = ${JSON.stringify(moduleDir)};
        // Normalize posix path
        var parts = (baseDir + '/' + id).split('/');
        var stack = [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === '' || parts[i] === '.') continue;
            if (parts[i] === '..') {
                if (stack.length > 0) stack.pop();
            } else {
                stack.push(parts[i]);
            }
        }
        var norm = './' + stack.join('/');

        var validKeys = ${JSON.stringify(allKeys)};
        if (validKeys.indexOf(norm) !== -1) return __webpack_require__(norm);
        if (validKeys.indexOf(norm + '.jsx') !== -1) return __webpack_require__(norm + '.jsx');
        if (validKeys.indexOf(norm + '.js') !== -1) return __webpack_require__(norm + '.js');
        if (validKeys.indexOf(norm + '/index.js') !== -1) return __webpack_require__(norm + '/index.js');
        return __webpack_require__(norm);
    }

    return __webpack_require__(id);
};
`;
    const fullCode = requireInterceptor + '\n' + rawCompiled;
    return `/***/ "${moduleKey}":
/*!****************************************!*\\
  !*** ${moduleKey} ***!
  \\****************************************/
/***/ ((module, exports, __webpack_require__) => {

${fullCode}

/***/ }),`;
}

function compileRpcModule(srcRelPath, moduleKey, allKeys) {
    console.log(`Compiling RPC module: ${srcRelPath} -> ${moduleKey}`);
    const rawCompiled = execSync(`npx esbuild "${srcRelPath}" --format=cjs`, { encoding: 'utf8' });
    const moduleDir = path.posix.dirname(moduleKey);

    const requireInterceptor = `
var require = function(id) {
    var fixedMap = ${JSON.stringify(RPC_MAP)};
    if (fixedMap[id]) return __webpack_require__(fixedMap[id]);

    if (id.startsWith('.')) {
        var baseDir = ${JSON.stringify(moduleDir)};
        var parts = (baseDir + '/' + id).split('/');
        var stack = [];
        for (var i = 0; i < parts.length; i++) {
            if (parts[i] === '' || parts[i] === '.') continue;
            if (parts[i] === '..') {
                if (stack.length > 0) stack.pop();
            } else {
                stack.push(parts[i]);
            }
        }
        var norm = './' + stack.join('/');
        var validKeys = ${JSON.stringify(allKeys)};
        if (validKeys.indexOf(norm) !== -1) return __webpack_require__(norm);
        if (validKeys.indexOf(norm + '.js') !== -1) return __webpack_require__(norm + '.js');
        return __webpack_require__(norm);
    }

    return __webpack_require__(id);
};
`;
    const fullCode = requireInterceptor + '\n' + rawCompiled;
    const evalContent = JSON.stringify(fullCode + `\n//# sourceURL=webpack://discord-rpc/${moduleKey}?`);

    return `/***/ "${moduleKey}":
/*!*************************************!*\\
  !*** ${moduleKey} ***!
  \\*************************************/
/***/ ((module, exports, __webpack_require__) => {

eval(${evalContent});

/***/ }),`;
}

function build() {
    console.log('--- STARTING BUILD & INJECTION ---');

    // Restore from clean backups first so we always inject into known-good state
    if (fs.existsSync('client-dist/bundle.js.bak')) {
        fs.copyFileSync('client-dist/bundle.js.bak', 'client-dist/bundle.js');
    }
    if (fs.existsSync('rpc_client-dist/bundle.js.bak')) {
        fs.copyFileSync('rpc_client-dist/bundle.js.bak', 'rpc_client-dist/bundle.js');
    }

    // Read bundles
    let clientBundle = fs.readFileSync('client-dist/bundle.js', 'utf8');
    const clientKeys = [...clientBundle.matchAll(/\/\*\*\*\/ \"([^\"]+)\":/g)].map(m => m[1]);

    let rpcBundle = fs.readFileSync('rpc_client-dist/bundle.js', 'utf8');
    const rpcKeys = [...rpcBundle.matchAll(/\/\*\*\*\/ \"([^\"]+)\":/g)].map(m => m[1]);

    // 1. Update client-dist/bundle.js
    console.log('\n[1/2] Updating client-dist/bundle.js...');
    const clientModules = [
        { src: 'src/client-src/components/ConfigItem.jsx', key: './src/client-src/components/ConfigItem.jsx' },
        { src: 'src/client-src/components/Icons.jsx', key: './src/client-src/components/Icons.jsx' },
        { src: 'src/client-src/page/Config.jsx', key: './src/client-src/page/Config.jsx' },
        { src: 'src/client-src/page/Preview.jsx', key: './src/client-src/page/Preview.jsx' },
        { src: 'src/client-src/page/Debug.jsx', key: './src/client-src/page/Debug.jsx' },
        { src: 'src/client-src/page/Repository.jsx', key: './src/client-src/page/Repository.jsx' },
        { src: 'src/rpc_client-src/localstorage.js', key: './src/rpc_client-src/localstorage.js' }
    ];

    for (const mod of clientModules) {
        const block = compileClientModule(mod.src, mod.key, clientKeys);
        clientBundle = replaceModuleInBundle(clientBundle, mod.key, block);
    }
    fs.writeFileSync('client-dist/bundle.js', clientBundle, 'utf8');
    console.log('Successfully updated client-dist/bundle.js!');

    // 2. Update rpc_client-dist/bundle.js
    console.log('\n[2/2] Updating rpc_client-dist/bundle.js...');
    const rpcModules = [
        { src: 'src/rpc_client-src/localstorage.js', key: './src/rpc_client-src/localstorage.js' },
        { src: 'src/rpc_client-src/rpc.js', key: './src/rpc_client-src/rpc.js' },
        { src: 'src/rpc_client-src/index.js', key: './src/rpc_client-src/index.js' }
    ];

    for (const mod of rpcModules) {
        const block = compileRpcModule(mod.src, mod.key, rpcKeys);
        rpcBundle = replaceModuleInBundle(rpcBundle, mod.key, block);
    }
    fs.writeFileSync('rpc_client-dist/bundle.js', rpcBundle, 'utf8');
    console.log('Successfully updated rpc_client-dist/bundle.js!');

    console.log('\n--- BUILD COMPLETED SUCCESSFULLY ---');
}

build();
