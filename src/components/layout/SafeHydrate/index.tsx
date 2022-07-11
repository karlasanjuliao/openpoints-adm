import { FC } from 'react'

import { Wrapper } from './styles'

const SafeHydrate: FC = ({ children }) => {
  return (
    <Wrapper suppressHydrationWarning>
      {typeof window === 'undefined' ? null : children}
    </Wrapper>
  )
}

export default SafeHydrate
