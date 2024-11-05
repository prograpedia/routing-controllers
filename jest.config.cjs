module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverageFrom: ['src/**/*.ts', '!src/**/index.ts', '!src/**/*.interface.ts'],
  globals: {},
  setupFilesAfterEnv: ["./jest.setup.js"],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        diagnostics: {
          ignoreCodes: [1343, 2441]
        },
        tsconfig: './tsconfig.spec.json'},
    ],
  }
};
