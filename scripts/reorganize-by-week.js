#!/usr/bin/env node
/* eslint-disable no-console, no-restricted-imports, @typescript-eslint/no-unused-vars */
/**
 * Script to reorganize activity notes from month-based to week-based structure
 * 
 * Usage: node scripts/reorganize-by-week.js <source-dir> <dest-dir> <year>
 * 
 * Example:
 *   node scripts/reorganize-by-week.js \
 *     "/path/to/activity/notes/2026/1" \
 *     "/path/to/activity/notes" \
 *     2026
 */

import { readdir, readFile, writeFile, mkdir } from 'fs/promises';
import { join, basename } from 'path';
import { existsSync } from 'fs';

// Simple week calculation (Sunday-based)
function getWeekNumber(date) {
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((date - startOfYear) / (24 * 60 * 60 * 1000));
    
    // Find the first Sunday of the year
    const firstDayOfYear = startOfYear.getDay(); // 0 = Sunday
    const daysUntilFirstSunday = firstDayOfYear === 0 ? 0 : 7 - firstDayOfYear;
    
    // Calculate week number (1-based)
    const daysSinceFirstSunday = dayOfYear - daysUntilFirstSunday;
    if (daysSinceFirstSunday < 0) {
        return 1;
    }
    return Math.floor(daysSinceFirstSunday / 7) + 1;
}

async function reorganizeByWeek(sourceDir, destDir, year) {
    console.log(`Reorganizing files from ${sourceDir} to ${destDir} for year ${year}`);
    
    // Read all files in source directory
    const files = await readdir(sourceDir);
    const mdFiles = files.filter(f => f.endsWith('.md'));
    
    console.log(`Found ${mdFiles.length} markdown files`);
    
    for (const file of mdFiles) {
        // Extract day from filename (format: DD-HHMM-title.md)
        const match = file.match(/^(\d{1,2})-/);
        if (!match) {
            console.warn(`Skipping ${file} - couldn't extract day from filename`);
            continue;
        }
        
        const day = parseInt(match[1]);
        
        // Determine month from source directory
        const monthMatch = sourceDir.match(/\/(\d{1,2})$/);
        if (!monthMatch) {
            console.error(`Couldn't determine month from source directory: ${sourceDir}`);
            continue;
        }
        const month = parseInt(monthMatch[1]);
        
        // Create date and calculate week
        const date = new Date(year, month - 1, day);
        const week = getWeekNumber(date);
        
        // Create destination directory with "Week " prefix
        const weekDir = join(destDir, year.toString(), `Week ${week}`);
        if (!existsSync(weekDir)) {
            await mkdir(weekDir, { recursive: true });
            console.log(`Created directory: ${weekDir}`);
        }
        
        // Copy file
        const sourcePath = join(sourceDir, file);
        const destPath = join(weekDir, file);
        
        const content = await readFile(sourcePath, 'utf-8');
        await writeFile(destPath, content, 'utf-8');
        
        console.log(`${file} (day ${day}) -> Week ${week}`);
    }
    
    console.log('Reorganization complete!');
}

// Parse command line arguments
const args = process.argv.slice(2);
if (args.length !== 3) {
    console.error('Usage: node reorganize-by-week.js <source-dir> <dest-dir> <year>');
    console.error('Example: node reorganize-by-week.js "/path/to/2026/1" "/path/to" 2026');
    process.exit(1);
}

const [sourceDir, destDir, year] = args;
reorganizeByWeek(sourceDir, destDir, parseInt(year)).catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
