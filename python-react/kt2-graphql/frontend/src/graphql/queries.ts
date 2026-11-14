import { gql } from '@apollo/client'
import type { Category, Task } from '../types'

export type AllTasksData = { allTasks: Task[] }
export type CategoriesData = { categories: Pick<Category, 'id' | 'name'>[] }

export const ALL_TASKS = gql`
  query AllTasks {
    allTasks {
      id
      title
      description
      isCompleted
      category {
        id
        name
        color
      }
    }
  }
`

export const CATEGORIES = gql`
  query Categories {
    categories {
      id
      name
    }
  }
`
