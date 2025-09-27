import nextJest from 'next/jest.js'

const createJestConfig = nextJest({
   // Provide the path to your Next.js app to load next.config.js and .env files
   dir: './',
})

// Add any custom config to be passed to Jest
const customJestConfig = {
   setupFilesAfterEnv: ['<rootDir>/jest.setup.mjs'],
   moduleNameMapper: {
      // Handle module aliases (this will be automatically configured for you based on your tsconfig.json paths)
      '^@/(.*)$': '<rootDir>/src/$1',
   },
   testEnvironment: 'jest-environment-jsdom',
   transform: {
      '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', { presets: ['next/babel'] }],
   },
   moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
}

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig)
