export function GradientSpan({ children }) {
  return <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
    {children}
  </span>
}