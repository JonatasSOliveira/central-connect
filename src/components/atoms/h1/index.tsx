import { forwardRef } from 'react'

interface H1Props extends React.HTMLAttributes<HTMLHeadingElement> {
  children: string
}

export const H1 = forwardRef<HTMLHeadingElement, H1Props>(
  ({ children, ...props }, ref) => (
    <h1 className="text-2xl font-bold" ref={ref} {...props}>
      {children}
    </h1>
  ),
)

H1.displayName = 'H1'
