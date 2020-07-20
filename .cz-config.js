module.exports = {
  types: [
    {
      name: "feat: A new feature",
      title: "feat",
      value: "feat",
    },
    {
      name: "fix: A bug fix",
      title: "fix",
      value: "fix",
    },
    {
      name: "docs: Documentation only changes",
      title: "docs",
      value: "docs",
    },
    {
      name:
        "style: Changes that do not affect the meaning of the code (white-space, formatting, missing semi-colons, etc)",
      title: "style",
      value: "style",
    },
    {
      name:
        "refactor: A code change that neither fixes a bug nor adds a feature",
      title: "refactor",
      value: "refactor",
    },
    {
      name: "perf: A code change that improves performance",
      title: "perf",
      value: "perf",
    },
    {
      name: "test: Adding missing tests or correcting existing tests",
      title: "test",
      value: "test",
    },
    {
      name:
        "chore: Changes to the build process or auxiliary tools and libraries such as documentation generation",
      title: "chore",
      value: "chore",
    },
  ],
  scopes: [
    { name: "decomoji" },
    { name: "docs" },
    { name: "generator" },
    { name: "manager" },
    { name: "utilities" },
    { name: "_" }, // その他
  ],
  messages: {
    scope: "Scope of changes:\n",
  },
};
