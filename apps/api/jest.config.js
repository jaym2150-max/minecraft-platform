module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: '\\.(spec|test)\\.ts$',
  rootDir: '.',
  rootDirs: ['./src', './test'],
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coveragePathIgnorePatterns: ['/node_modules/', '/dist/'],
  moduleNameMapper: {
    '^@mcp/(.*)$': '<rootDir>/../../packages/$1/src',
  },
};
