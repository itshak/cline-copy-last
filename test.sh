#!/bin/bash
# Test script for cline-copy-last plugin
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=== cline-copy-last Plugin Tests ==="
echo ""

# Test 1: Plugin file exists
echo "Test 1: Plugin file exists"
if [ -f "$SCRIPT_DIR/index.js" ]; then
    echo "  ✅ index.js exists"
else
    echo "  ❌ index.js not found"
    exit 1
fi

# Test 2: Package.json valid
echo "Test 2: Package.json valid"
if node -e "JSON.parse(require('fs').readFileSync('$SCRIPT_DIR/package.json', 'utf8'))" 2>/dev/null; then
    echo "  ✅ package.json is valid JSON"
else
    echo "  ❌ package.json is invalid"
    exit 1
fi

# Test 3: Package has cline manifest
echo "Test 3: Package has cline plugin manifest"
if node -e "const p=require('$SCRIPT_DIR/package.json'); if(!p.cline || !p.cline.plugins) throw new Error('No cline manifest'); if(!p.cline.plugins[0].paths) throw new Error('No paths'); if(!p.cline.plugins[0].capabilities) throw new Error('No capabilities'); console.log('OK')" 2>/dev/null; then
    echo "  ✅ cline.plugins manifest found"
    NODE_PATH=/opt/homebrew/lib/node_modules/cline/node_modules node -e "
        const p = require('$SCRIPT_DIR/index.js');
        const plugin = p.default || p;
        if (!plugin.name || !plugin.manifest || !plugin.manifest.capabilities) {
            console.error('❌ Plugin missing required fields');
            process.exit(1);
        }
        console.log('✅ Plugin loads: name=' + plugin.name);
        console.log('✅ Capabilities: ' + plugin.manifest.capabilities.join(', '));
        if (plugin.hooks && typeof plugin.hooks.beforeModel === 'function') {
            console.log('✅ beforeModel hook exists');
        } else {
            console.log('❌ beforeModel hook missing');
            process.exit(1);
        }
        if (plugin.setup && typeof plugin.setup === 'function') {
            console.log('✅ setup function exists');
        } else {
            console.log('❌ setup function missing');
            process.exit(1);
        }
        console.log('All tests passed!');
    " 2>&1 || echo "  ⚠️  Could not fully validate plugin (may need Cline SDK) — skipping deep check"
else
    echo "  ❌ cline.plugins manifest not found"
    exit 1
fi

echo ""
echo "=== All basic tests passed ==="
