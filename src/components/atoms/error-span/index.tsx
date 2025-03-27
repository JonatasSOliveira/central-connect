interface ErrorSpanProps {
  error?: string
}

export const ErrorSpan: React.FC<ErrorSpanProps> = ({ error }) =>
  error && <span className="text-sm text-red-500">{error}</span>
