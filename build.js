

/*
// Copy

src/shared -> packages/vite-deadsimpleseo/src/shared
src/shared -> packages/deadsimpleseo-react/src/shared

src/plugin -> packages/vite-deadsimpleseo/src/plugin
src/framework -> packages/deadsimpleseo-react/src/framework

// Generate index.ts files in each package that re-export from src
// so that build outputs go to dist/index.js
*/

import fs from 'fs/promises';
import path from 'path';

async function copyFile(srcFile, destFile) {
    await fs.mkdir(path.dirname(destFile), { recursive: true });
    // if (await fs.access(srcFile).catch(() => false)) {
    //     await fs.copyFile(srcFile, destFile);
    // }
    const stats = await fs.stat(srcFile).catch(() => null);
    if (stats?.isFile()) {
        await fs.copyFile(srcFile, destFile);
    }
}

async function copyDir(srcDir, destDir) {
    await fs.mkdir(destDir, { recursive: true });
    const entries = await fs.readdir(srcDir, { withFileTypes: true });

    for (const entry of entries) {
        const srcPath = `${srcDir}/${entry.name}`;
        const destPath = `${destDir}/${entry.name}`;

        if (entry.isDirectory()) {
            await copyDir(srcPath, destPath);
        } else if (entry.isFile()) {
            await fs.copyFile(srcPath, destPath);
        }
    }
}

// type PackageName = 'vite-deadsimpleseo' | 'deadsimpleseo-react';

/** @typedef {'vite-deadsimpleseo' | 'deadsimpleseo-react'} PackageName */

async function runCommand(command, args, options = {}) {
    const { spawn } = await import('child_process');
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, { stdio: 'inherit', ...options });
        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`${command} exited with code ${code}`));
            }
        });
    });
}

async function copyCommon(/** @type {PackageName} */ packageName) {
    // Copy README.md and LICENSE
    await copyFile('README.md', `packages/${packageName}/README.md`);
    await copyFile('LICENSE', `packages/${packageName}/LICENSE`);

    // Copy tsconfig.json
    await copyFile('tsconfig.json', `packages/${packageName}/tsconfig.json`);

    // Copy .npmignore
    await copyFile('.npmignore', `packages/${packageName}/.npmignore`);

    // Copy src/shared
    await copyDir('src/shared', `packages/${packageName}/src/shared`);

    // // Generate index.ts
    // await generateIndex(packageName);

    // // Generate package.json (filtered)
    // await generatePackageJson(packageName);
}

async function main() {
    await copyCommon('vite-deadsimpleseo');
    await copyCommon('deadsimpleseo-react');

    // Copy the specific directory (plugin or framework)
    // await copyDir('src/framework', 'packages/deadsimpleseo-react/src/framework');
    // await copyDir('src/plugin', 'packages/vite-deadsimpleseo/src/plugin');

    console.log('Building TypeScript for vite-deadsimpleseo...');
    await runCommand('npx', ['tsc', '-b', 'tsconfig.json'], { cwd: path.join(process.cwd(), 'packages/vite-deadsimpleseo') });
    console.log('Building TypeScript for deadsimpleseo-react (using vite)...');
    // await runCommand('npx', ['tsc', '-b', 'tsconfig.json'], { cwd: path.join(process.cwd(), 'packages/deadsimpleseo-react') });
    await runCommand('npx', ['vite', 'build'], { cwd: path.join(process.cwd(), 'packages/deadsimpleseo-react') });
}

main().catch(err => {
    console.error('Error during prebuild:', err);
    process.exit(1);
});
