import { defineConfig } from 'vitest/config';

export default defineConfig({
    test: {
        globals: false,
        environment: 'node',
        setupFiles: ['tests/setup.ts'],
        include: ['tests/**/*.test.ts'],
        exclude: ['node_modules/**/*', 'dist/**/*'],
        coverage: {
            provider: 'v8',
            reporter: ['text', 'html', 'lcov'],
            include: ['src/**/*'],
            exclude: ['dist/**/*', 'node_modules/**/*'],
            thresholds: {
                lines: 44,
                statements: 44,
                branches: 25,
                functions: 60,
            },
        },
    },
    resolve: {
        alias: {
            '@': '/src',
        },
    },
}); 