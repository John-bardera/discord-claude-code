/**
 * Agent definitions for multi-agent support
 */

export interface AgentIdentity {
  id: string;
  name: string;
  emoji: string;
  color: number;
  avatar?: string;  // URL to agent avatar image
  description: string;
}

/**
 * All available agents
 */
export const AGENTS: Record<string, AgentIdentity> = {
  planner: {
    id: 'planner',
    name: 'Planner',
    emoji: '📋',
    color: 0x3498db,  // Blue
    description: 'Implementation planning and task breakdown',
  },
  architect: {
    id: 'architect',
    name: 'Architect',
    emoji: '🏗️',
    color: 0x9b59b6,  // Purple
    description: 'System design and architectural decisions',
  },
  'tdd-guide': {
    id: 'tdd-guide',
    name: 'TDD Guide',
    emoji: '🧪',
    color: 0x2ecc71,  // Green
    description: 'Test-driven development guidance',
  },
  'code-reviewer': {
    id: 'code-reviewer',
    name: 'Code Reviewer',
    emoji: '👁️',
    color: 0xf39c12,  // Orange
    description: 'Code quality and security review',
  },
  'security-reviewer': {
    id: 'security-reviewer',
    name: 'Security Reviewer',
    emoji: '🔒',
    color: 0xe74c3c,  // Red
    description: 'Security vulnerability analysis',
  },
  'build-error-resolver': {
    id: 'build-error-resolver',
    name: 'Build Resolver',
    emoji: '🔧',
    color: 0xe67e22,  // Dark Orange
    description: 'Build and type error resolution',
  },
  'e2e-runner': {
    id: 'e2e-runner',
    name: 'E2E Runner',
    emoji: '🎭',
    color: 0x1abc9c,  // Teal
    description: 'End-to-end testing specialist',
  },
  'refactor-cleaner': {
    id: 'refactor-cleaner',
    name: 'Refactor Cleaner',
    emoji: '🧹',
    color: 0x95a5a6,  // Gray
    description: 'Dead code cleanup and refactoring',
  },
  'doc-updater': {
    id: 'doc-updater',
    name: 'Doc Updater',
    emoji: '📚',
    color: 0x34495e,  // Dark Blue
    description: 'Documentation updates',
  },
};

/**
 * Parse agent from message content
 * Detects patterns like "[Planner]", "Architect:", "TDD Guide: ..."
 */
export function parseAgentFromMessage(content: string): AgentIdentity | null {
  // Try various patterns
  const patterns = [
    /\[([a-zA-Z-]+)\]/,  // [Planner]
    /^([a-zA-Z-]+):\s*/,  // Planner:
    /\*\*([a-zA-Z-]+)\*\*:/,  // **Planner**:
  ];

  for (const pattern of patterns) {
    const match = content.match(pattern);
    if (match) {
      const agentId = match[1].toLowerCase();
      const agent = AGENTS[agentId];
      if (agent) {
        return agent;
      }
    }
  }

  return null;
}

/**
 * Get agent by ID
 */
export function getAgent(id: string): AgentIdentity | null {
  return AGENTS[id.toLowerCase()] || null;
}

/**
 * Get all agent IDs
 */
export function getAgentIds(): string[] {
  return Object.keys(AGENTS);
}
