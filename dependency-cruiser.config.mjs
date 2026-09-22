/** @type {import('dependency-cruiser').IConfiguration} */
export default {
  forbidden: [
    {
      name: "module-domain-does-not-depend-on-outer-layers",
      comment: "Module domain code must remain independent of outer layers.",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/domain" },
      to: {
        path: [
          "^src/(app|composition|infrastructure)",
          "^src/modules/([^/]+)/(application|infrastructure|presentation|frontend)",
          "^node_modules/(next|firebase|firebase-admin|zod)",
        ],
      },
    },
    {
      name: "module-application-does-not-depend-on-adapters",
      comment: "Application code may depend on ports, never concrete adapters.",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/application" },
      to: {
        path: [
          "^src/(app|composition|infrastructure)",
          "^src/modules/([^/]+)/(infrastructure|presentation|frontend)",
          "^node_modules/(next|firebase|firebase-admin)",
        ],
      },
    },
    {
      name: "module-presentation-does-not-depend-on-infrastructure",
      comment: "HTTP presentation code receives adapters through composition.",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/presentation" },
      to: {
        path: ["^src/infrastructure", "^src/modules/([^/]+)/infrastructure"],
      },
    },
    {
      name: "module-frontend-does-not-depend-on-backend",
      comment: "Frontend code communicates through public API contracts.",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/frontend" },
      to: {
        path: [
          "^src/application",
          "^src/domain",
          "^src/infra",
          "^src/modules/([^/]+)/(application|domain|infrastructure|presentation)",
        ],
      },
    },
    {
      name: "shared-does-not-depend-on-modules",
      comment: "Shared code cannot know feature modules.",
      severity: "error",
      from: { path: "^src/shared" },
      to: { path: "^src/modules" },
    },
    {
      name: "module-does-not-import-another-module-composition",
      comment: "Cross-module dependencies must use ports or public contracts.",
      severity: "error",
      from: { path: "^src/modules/([^/]+)/composition" },
      to: { path: "^src/modules/([^/]+)/composition" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    exclude: "(^|/)(\\.next|dist|build|node_modules)(/|$)",
    tsConfig: { fileName: "tsconfig.json" },
    enhancedResolveOptions: {
      extensions: [".ts", ".tsx", ".js", ".jsx", ".json"],
    },
  },
};
