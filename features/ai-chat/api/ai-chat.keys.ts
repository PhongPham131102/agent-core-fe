export const aiChatKeys = {
  all: ["ai-chat"] as const,
  agents: () => [...aiChatKeys.all, "agents"] as const,
  threads: () => [...aiChatKeys.all, "threads"] as const,
  threadList: (agentUid: string) => [...aiChatKeys.threads(), agentUid] as const,
  messages: (threadUid: string) => [...aiChatKeys.all, "messages", threadUid] as const,
};
