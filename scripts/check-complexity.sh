#!/bin/bash

# Configuration
MAX_PRESENTER_LINES=150
SRC_DIR="./src"
REPORT_PATH="./src/graphify-out/GRAPH_REPORT.md"
GRAPHIFY_BIN="/Users/phanvu/.local/share/uv/tools/graphifyy/bin/graphify"

echo "🚀 Starting Architectural Health Check..."

# 1. Run Architectural Lint
echo "--- Checking Layer Integrity ---"
npm run lint:arch
if [ $? -ne 0 ]; then
    echo "❌ Architectural violations found!"
    # exit 1 # Optional: stop build on error
fi

# 2. Check Presenter Complexity
echo "--- Checking Complexity Budgets ---"
VIOLATIONS=0
for f in $(find src/modules -name "*Presenter.ts"); do
    line_count=$(wc -l < "$f")
    if [ $line_count -gt $MAX_PRESENTER_LINES ]; then
        echo "⚠️  Complexity Warning: $f has $line_count lines (Max: $MAX_PRESENTER_LINES)"
        VIOLATIONS=$((VIOLATIONS+1))
    else
        echo "✅ $f: $line_count lines"
    fi
done

# 3. Update Graph Report
echo "--- Updating Graph Report ---"
$GRAPHIFY_BIN update $SRC_DIR --force
echo "📊 Graph report updated at $REPORT_PATH"

if [ $VIOLATIONS -gt 0 ]; then
    echo "❌ Total complexity violations: $VIOLATIONS"
else
    echo "✨ All systems nominal."
fi
