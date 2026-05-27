/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-no-external-deps',
      comment: 'Domain layer should not depend on any other internal layer',
      severity: 'error',
      from: { path: 'src/modules/[^/]+/domain/.+' },
      to: {
        path: 'src/modules/[^/]+/(application|infrastructure|presentation)/.+',
      },
    },
    {
      name: 'application-only-domain-deps',
      comment: 'Application layer should only depend on Domain layer',
      severity: 'error',
      from: { path: 'src/modules/[^/]+/application/.+' },
      to: {
        path: 'src/modules/[^/]+/(infrastructure|presentation)/.+',
      },
    },
    {
      name: 'infrastructure-only-domain-deps',
      comment: 'Infrastructure layer should only depend on Domain layer (implements Repo)',
      severity: 'error',
      from: { path: 'src/modules/[^/]+/infrastructure/.+' },
      to: {
        path: 'src/modules/[^/]+/(application|presentation)/.+',
      },
    },
    {
      name: 'no-cross-module-presentation-deps',
      comment: 'Presentation layer should not depend on another module\'s presentation logic',
      severity: 'warn',
      from: { path: 'src/modules/(?!sandbox)([^/]+)/presentation/.+' },
      to: {
        path: 'src/modules/(?!$1)[^/]+/presentation/.+',
      },
    },
    {
      name: 'design-system-no-domain-deps',
      comment: 'Shared design system should be 100% Dumb UI and must not import from feature modules',
      severity: 'error',
      from: { path: 'src/shared/design-system/.+' },
      to: {
        path: 'src/modules/.+',
      },
    },
    {
      name: 'no-circular-deps',
      comment: 'Circular dependencies are a sign of bad design',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: {
      path: 'node_modules',
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: 'tsconfig.json',
    },
    enhancedResolveOptions: {
      exportsFields: ['exports'],
      conditionNames: ['import', 'require', 'node', 'default'],
      mainFields: ['module', 'main'],
    },
    reporterOptions: {
    },
  },
};
