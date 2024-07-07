import process from 'node:process';
import { build } from 'esbuild';
import { glob } from 'glob';
import packageJson from './package.json' assert { type: 'json' };

glob('src/**/*.ts', (err, matches) => {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  const shared = {
    bundle: true,
    entryPoints: matches,
    outdir: './dist',
    external: Object.keys(packageJson.dependencies ?? {}),
    logLevel: 'info',
    sourcemap: false,
    target: ['node18'],
  };

  build({
    ...shared,
    format: 'esm',
    entryNames: '[dir]/[name].esm',
  });

  build({
    ...shared,
    format: 'cjs',
    entryNames: '[dir]/[name].cjs',
  });
});
