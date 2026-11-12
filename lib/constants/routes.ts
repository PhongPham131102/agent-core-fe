export const routes = {
  home: "/",
  login: "/login",
  users: "/users",
  roles: "/roles",
  profile: "/profile",
  aiApiKeys: "/ai-api-keys",
  aiAgents: "/ai-agents",
  aiAgentDetail: (uid: string) => `/ai-agents/${uid}`,
} as const;
