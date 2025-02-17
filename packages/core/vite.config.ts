import { defineConfig } from 'vite';
import { name, version } from './package.json';
import path from 'path';
import createExternal from 'vite-plugin-external';

const resolve = (url: string) => path.resolve(__dirname, url);

export default defineConfig({
    build: {
        lib: {
            entry: resolve('src/index.ts'),
            name: 'UniverSheet',
            formats: ['es', 'umd'],
            fileName: 'universheet-core',
        },
        outDir: './lib',
    },
    define: {
        pkgJson: { name, version },
    },
    css: {
        modules: {
            localsConvention: 'camelCaseOnly', // dash to camelCase conversion// .apply-color -> applyColor
            generateScopedName: 'univer-[local]', // custom prefix class name
        },
        preprocessorOptions: {
            less: {
                javascriptEnabled: true,
            },
        },
    },
    server: {
        port: 3102,
        open: true, // // Automatically open the app in the browser on server start.
    },

    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },

    plugins: [
        createExternal({
            externals: {
                'es6-proxy-polyfill': 'es6-proxy-polyfill',
                'reflect-metadata': 'reflect-metadata',
            },
        }),
    ],
});
