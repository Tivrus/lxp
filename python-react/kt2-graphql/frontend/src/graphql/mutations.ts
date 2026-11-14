import { gql } from '@apollo/client'

export type CreateTaskVariables = { title: string; categoryId: number }
export type TaskIdVariables = { id: number }

export const CREATE_TASK = gql`
  mutation CreateTask($title: String!, $categoryId: Int!) {
    createTask(title: $title, categoryId: $categoryId) {
      id
      title
    }
  }
`

export const COMPLETE_TASK = gql`
  mutation CompleteTask($id: Int!) {
    completeTask(id: $id) {
      id
      isCompleted
    }
  }
`

export const DELETE_TASK = gql`
  mutation DeleteTask($id: Int!) {
    deleteTask(id: $id)
  }
`
