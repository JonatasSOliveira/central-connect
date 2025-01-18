interface ContainerProps {
  children: React.ReactNode
  fullScreen?: boolean
}

export const Container: React.FC<ContainerProps> = ({
  children,
  fullScreen = true,
}) => {
  const InsiderContainer = () => (
    <div
      className={
        'flex flex-col items-center gap-2 rounded bg-white p-8 shadow-md' +
        (fullScreen ? ' flex-1' : '')
      }
    >
      {children}
    </div>
  )

  return fullScreen ? (
    <InsiderContainer />
  ) : (
    <div className="flex flex-1 items-center justify-center">
      <InsiderContainer />
    </div>
  )
}
