const execa = require('execa');
// const { targets: allTargets } = require('./util');

const buildTargets = [
    '@univer/core', // success
    '@univer/base-render', // success
    '@univer/base-sheets', // success

    // '@univer/sheets-plugin-format',
    // '@univer/sheets-plugin-formula',

    '@univer/sheets-plugin-alternating-colors', // success
    '@univer/sheets-plugin-conditional-format', // success
    '@univer/sheets-plugin-data-validation', // success
    '@univer/sheets-plugin-filter', // success
    '@univer/sheets-plugin-find', // success
    '@univer/sheets-plugin-frozen', // success
    '@univer/sheets-plugin-image', // success
    '@univer/sheets-plugin-insert-link', // success
    '@univer/sheets-plugin-pivot-table', // success
    '@univer/sheets-plugin-print', // success
    '@univer/sheets-plugin-protection', // success
    '@univer/sheets-plugin-screenshot', // success
    '@univer/sheets-plugin-sort', // success
    '@univer/sheets-plugin-split-column', // success

    // '@univer/style-google',
    '@univer/style-universheet', // success
    // '@univer/style-office365',
    // '@univer/style-mobile',
];

// TODO: run => build d.ts => build esm/umd

run();

async function run() {
    await buildAll(buildTargets);
}
// Reference https://github.com/vuejs/vue-next/blob/master/scripts/build.js
async function buildAll(targets) {
    await runParallel(require('os').cpus().length, targets, build);
}

async function runParallel(maxConcurrency, source, iteratorFn) {
    const ret = [];
    const executing = [];
    for (const item of source) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);

        if (maxConcurrency <= source.length) {
            const e = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= maxConcurrency) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}

async function build(target) {
    await execa('pnpm', ['run', '--filter', target, 'build'], { stdio: 'inherit' });
}
