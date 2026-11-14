export type TaskStatus = 'todo' | 'in_progress' | 'done'

export type Task = {
  id: number
  title: string
  description: string
  status: TaskStatus
  author: string
  assignee: string | null
  created_at: string
}

export type Comment = {
  id: number
  task_id: number
  author: string
  text: string
  created_at: string
}

export type Activity = {
  id: number
  text: string
  created_at: string
}

export type ServerEvent =
  | { type: 'presence'; users: string[] }
  | { type: 'task_created'; task: Task }
  | { type: 'task_updated'; task: Task }
  | { type: 'task_deleted'; task_id: number }
  | { type: 'comment_added'; comment: Comment }
  | { type: 'activity'; activity: Activity }
  | { type: 'notification'; text: string }

export const STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done']

export const STATUS_LABELS: Record<TaskStatus, string> = {
  todo: 'К выполнению',
  in_progress: 'В работе',
  done: 'Готово',
}
