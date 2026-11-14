export type Category = {
  id: number
  name: string
  color: string
}

export type Task = {
  id: number
  title: string
  description: string
  isCompleted: boolean
  category: Category
}
