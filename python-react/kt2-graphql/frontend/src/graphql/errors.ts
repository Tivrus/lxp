import { CombinedGraphQLErrors } from '@apollo/client'

export function getErrorMessage(error: unknown): string {
  if (CombinedGraphQLErrors.is(error)) {
    return error.errors.map((item) => item.message).join('; ')
  }
  if (error instanceof TypeError) {
    return 'Сервер недоступен, проверьте, что он запущен'
  }
  return error instanceof Error ? error.message : 'Неизвестная ошибка'
}
