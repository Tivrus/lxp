export const MIN_USERNAME_LENGTH = 2
export const MIN_PASSWORD_LENGTH = 6

export function validateUsername(value: string) {
  const username = value.trim()
  if (username.length < MIN_USERNAME_LENGTH) {
    return `Минимум ${MIN_USERNAME_LENGTH} символа`
  }
  if (username.includes(' ')) {
    return 'Логин не должен содержать пробелов'
  }
  return ''
}

export function validatePassword(value: string) {
  return value.length < MIN_PASSWORD_LENGTH ? `Минимум ${MIN_PASSWORD_LENGTH} символов` : ''
}
