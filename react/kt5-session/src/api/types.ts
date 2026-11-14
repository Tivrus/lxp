export interface User {
  username: string
  role: 'user' | 'admin'
}

export interface UserToken {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
}

export interface Course {
  id: string
  title: string
  description: string
}

export interface RecordItem {
  id: number
  created_at: string
  course: Course
  author: User
}

export interface RecordsListResponse {
  records: RecordItem[]
  records_count: number
}
