import { defineConfig } from 'vite';
import { VitePluginNode } from 'vite-plugin-node';
import replace from '@rollup/plugin-replace';
// import { visualizer } from 'rollup-plugin-visualizer';
import { execSync } from 'child_process';
import shebang from 'rollup-plugin-preserve-shebang';
import path from 'path';

let gitInfo = {
    branch: '',
    commit: '',
    tags: '',
    commitDate: '',
};

try {
    gitInfo = {
        branch: execSync('git rev-parse --abbrev-ref HEAD').toString().trim(),
        commit: execSync('git rev-parse --short HEAD').toString().trim(),
        tags: '',
        commitDate: execSync('git log -1 --format=%cd --date=iso').toString().trim(),
    };

    try {
        gitInfo.tags = execSync('git tag --points-at HEAD | paste -sd "," -').toString().trim();
    } catch {
        gitInfo.tags = '';
    }
} catch {
    // eslint-disable-next-line no-console
    console.log('Directory does not have a Git repository, skipping git info');
}


const isProduction = process.env.NODE_ENV === 'production' || process.argv.includes('build');

export default defineConfig({
    server: {
        port: 3000
    },
    plugins: [
        // Only use VitePluginNode in dev mode, not for builds
        ...(isProduction ? [] : VitePluginNode({
            adapter: 'express',
            appPath: './src/main.ts',
            exportName: 'viteNodeApp',
            tsCompiler: 'swc',
            swcOptions: {
                sourceMaps: true,
            },
        })),
        replace({
            '__VERSION__': process.env.npm_package_version,
            '__GIT_BRANCH__': gitInfo.branch,
            '__GIT_COMMIT__': gitInfo.commit,
            '__GIT_TAGS__': gitInfo.tags === '' ? '' : `T:${gitInfo.tags}`,
            '__GIT_COMMIT_DATE__': gitInfo.commitDate,
            '__SYSTEM_INFO__': `${process.platform} ${process.arch} ${process.version}`,
            preventAssignment: true,
        }),
        shebang({
            shebang: '#!/usr/bin/env node',
        }),
    ],
    build: {
        target: 'esnext',
        outDir: 'dist',
        ssr: true,
        rollupOptions: {
            external: [
                '@riotprompt/riotprompt', 
                '@riotprompt/riotprompt/formatter', 
                '@riotprompt/riotprompt/chat',
                '@anthropic-ai/sdk',
                '@google/generative-ai',
                '@modelcontextprotocol/sdk',
                '@theunwalked/cardigantime',
                '@theunwalked/dreadcabinet',
                'commander',
                'dayjs',
                'dotenv',
                'dotenv/config',
                'glob',
                'js-yaml',
                'luxon',
                'moment-timezone',
                'openai',
                'winston',
                'zod',
            ],
            input: {
                'main': 'src/main.ts',
                'init-job': 'src/init-job.ts',
                'validate-job': 'src/validate-job.ts',
                'mcp/server': 'src/mcp/server.ts',
            },
            output: {
                format: 'esm',
                entryFileNames: '[name].js',
                chunkFileNames: 'chunks/[name]-[hash].js',
            },
        },
        modulePreload: false,
        minify: false,
        sourcemap: true
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
}); 