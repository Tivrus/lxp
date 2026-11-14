export type ChatMessage = {
  type: 'message' | 'system' | 'error'
  username: string
  text: string
  timestamp: string
  users: string[] | null
}
