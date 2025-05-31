import React from "react"
import ReactDOM from "react-dom/client"
import { BrowserRouter } from "react-router-dom"
import App from "./App.jsx"
import "./index.css"
import { AuthProvider } from "./lib/auth-context.jsx"
import { BilletDataProvider } from "./lib/billet-context.jsx"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <BilletDataProvider>
          <App />
        </BilletDataProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
