import * as React from "react"

type Props = { children: React.ReactNode }
type State = { error: Error | null }

export class ErrorOverlay extends React.Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("App crashed:", error, info)
  }

  render() {
    if (this.state.error) {
      const route = typeof window !== "undefined" ? window.location.pathname : "?"
      const time = new Date().toLocaleTimeString()
      return (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100000,
            background: "#0a0a0a",
            color: "#fafafa",
            fontFamily: "monospace",
            padding: 20,
            overflow: "auto",
            whiteSpace: "pre-wrap",
          }}
        >
          <h2 style={{ color: "#f87171" }}>Runtime error (app crashed)</h2>
          <p style={{ color: "#fbbf24" }}>route: {route} · time: {time}</p>
          <p>{this.state.error.message}</p>
          <pre style={{ fontSize: 12, opacity: 0.8 }}>
            {this.state.error.stack}
          </pre>
        </div>
      )
    }
    return this.props.children
  }
}
