import { forwardRef } from 'react'

interface H2Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: string
}

export const H2 = forwardRef<HTMLHeadingElement, H2Props>(
  ({ children, ...props }, ref) => (
    <h2 className="text-xl font-bold" ref={ref} {...props}>
      {children}
    </h2>
  ),
)

H2.displayName = 'H2'
