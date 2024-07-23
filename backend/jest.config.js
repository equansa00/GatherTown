//home/equansa00/Desktop/GatherTown/jest.config.js
module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  globalSetup: './__test__/setup.js',
  globalTeardown: './__test__/teardown.js',
  setupFilesAfterEnv: ['./__test__/jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/'],
  moduleFileExtensions: ['js', 'mjs', 'cjs', 'jsx', 'ts', 'tsx', 'json', 'node'],
};
