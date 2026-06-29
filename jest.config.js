module.exports = {
  testEnvironment: 'jsdom',
  moduleFileExtensions: ['js', 'json', 'vue'],
  transform: {
    '^.+\\.js$': 'babel-jest',
    '.*\\.vue$': 'vue-jest'
  },
  testMatch: ['<rootDir>/tests/**/*.spec.js'],
  collectCoverageFrom: ['src/**/*.{js,vue}', '!src/main.js']
}
