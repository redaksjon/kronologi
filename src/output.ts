import { writeFile } from "fs/promises";

import { dirname } from "path";

import { mkdir } from "fs/promises";
import { join } from "path";

export async function writeOutputFile(
    baseDir: string,
    year: number,
    period: number | string,
    pattern: string,
    content: string | object,
    logger: any
): Promise<void> {
    const outputPath = join(baseDir, year.toString(), period.toString(), pattern);
    await mkdir(dirname(outputPath), { recursive: true });
    const fileContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    await writeFile(outputPath, fileContent);
    logger.info(`Output written to ${outputPath}`);
}
