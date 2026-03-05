export interface PlatformAction {
  type: 'navigate' | 'search' | 'open_trail';
  path: string;
  label: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  actions?: PlatformAction[];
}
