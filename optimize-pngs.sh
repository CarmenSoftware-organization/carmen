#!/bin/bash

echo "Finding PNG files to optimize..."
count=0

# Find all PNG files, excluding node_modules
find . -name "*.png" -type f ! -path "./node_modules/*" | while read -r file; do
  original_size=$(stat -f%z "$file")

  # Optimize using sips with quality reduction
  sips -s format png --setProperty formatOptions 70 "$file" --out "$file" 2>/dev/null

  new_size=$(stat -f%z "$file")
  saved=$((original_size - new_size))

  if [ $saved -gt 0 ]; then
    echo "Optimized: $file (saved $(($saved / 1024))KB)"
  fi

  count=$((count + 1))
done

echo "Optimization complete! Processed $count files."
