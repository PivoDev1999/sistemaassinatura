import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

// O esbuild do Vite nao emite emitDecoratorMetadata; o swc emite, e o Nest precisa disso para DI.
export default defineConfig({
  test: { include: ['test/**/*.e2e-spec.ts', 'src/**/*.spec.ts'], environment: 'node' },
  plugins: [
    swc.vite({
      module: { type: 'es6' },
      jsc: {
        target: 'es2022',
        parser: { syntax: 'typescript', decorators: true },
        transform: { legacyDecorator: true, decoratorMetadata: true },
      },
    }),
  ],
});
