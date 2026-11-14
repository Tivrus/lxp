import type { CSSProperties } from 'react'
import { colors } from '../theme'
import UserMenu from './UserMenu'

const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 20px',
  background: colors.panel,
  borderBottom: `1px solid ${colors.border}`,
}

function Header() {
  return (
    <header style={headerStyle}>
      <b>Личный кабинет</b>
      <UserMenu />
    </header>
  )
}

export default Header
