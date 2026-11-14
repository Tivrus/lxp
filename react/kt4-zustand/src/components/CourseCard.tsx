import type { CSSProperties } from 'react'
import type { CourseStats } from '../api/types'
import { colors } from '../theme'

type Props = {
  course: CourseStats
  isSelected: boolean
  onSelect: (id: string) => void
}

const styles: Record<string, CSSProperties> = {
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 10px',
    borderBottom: `1px solid ${colors.border}`,
    cursor: 'pointer',
  },
  count: {
    color: colors.textMuted,
  },
}

function CourseCard({ course, isSelected, onSelect }: Props) {
  return (
    <li
      style={{ ...styles.item, background: isSelected ? colors.selected : 'none' }}
      onClick={() => onSelect(course.id)}
    >
      <span>{course.title}</span>
      <span style={styles.count}>Заявок: {course.records_count}</span>
    </li>
  )
}

export default CourseCard
