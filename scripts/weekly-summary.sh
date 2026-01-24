#!/bin/bash
# Weekly Summary Helper Script
# 
# Usage:
#   ./scripts/weekly-summary.sh              # Current week
#   ./scripts/weekly-summary.sh 4            # Specific week
#   ./scripts/weekly-summary.sh 4 --dry-run  # Dry run

# Configuration
INDIVIDUAL_DIR="/Users/tobrien/Library/CloudStorage/GoogleDrive-tobrien@discursive.com/My Drive/individual"
KRONOLOGI_BIN="/Users/tobrien/gitw/redaksjon/kronologi/dist/main.js"

# Calculate current week number (Sunday-based)
calculate_week() {
    local year=$(date +%Y)
    local day_of_year=$(date +%j)
    
    # Get first day of year (0=Sunday, 1=Monday, etc.)
    local first_day=$(date -j -f "%Y-%m-%d" "${year}-01-01" +%w)
    
    # Calculate days until first Sunday
    local days_until_sunday=0
    if [ $first_day -ne 0 ]; then
        days_until_sunday=$((7 - first_day))
    fi
    
    # Calculate week number
    local days_since_sunday=$((day_of_year - days_until_sunday))
    if [ $days_since_sunday -lt 0 ]; then
        echo 1
    else
        echo $(((days_since_sunday / 7) + 1))
    fi
}

# Get current year
YEAR=$(date +%Y)

# Get week number (from argument or calculate current)
if [ -z "$1" ] || [[ "$1" == --* ]]; then
    WEEK=$(calculate_week)
    EXTRA_ARGS="$@"
else
    WEEK=$1
    shift
    EXTRA_ARGS="$@"
fi

echo "Generating weekly summary for week $WEEK of $YEAR..."
echo "Working directory: $INDIVIDUAL_DIR"
echo ""

# Change to the individual directory and run kronologi
cd "$INDIVIDUAL_DIR" || exit 1
"$KRONOLOGI_BIN" weekly-summary "$YEAR" "$WEEK" $EXTRA_ARGS

EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo ""
    echo "✓ Summary generated successfully!"
    echo "  Location: summary/$YEAR/$WEEK/summary.md"
    echo ""
    echo "  View summary:"
    echo "  cat \"$INDIVIDUAL_DIR/summary/$YEAR/$WEEK/summary.md\""
else
    echo ""
    echo "✗ Summary generation failed (exit code: $EXIT_CODE)"
fi

exit $EXIT_CODE
