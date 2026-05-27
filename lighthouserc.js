module.exports = {
  ci: {
    collect: {
      numberOfRuns: 3,
      startServerCommand: "npm run dev",
      url: ["http://localhost:5173/"],
    },
    assert: {
      assertions: {
        "categories:performance": ["error", { minScore: 0.85 }],
        "categories:accessibility": ["warn", { minScore: 0.80 }],
        "first-contentful-paint": ["error", { maxNumericValue: 3000 }],
        "largest-contentful-paint": ["error", { maxNumericValue: 4000 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: "temporary-public-storage",
    },
  },
};
