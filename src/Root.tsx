import { BrowserRouter } from 'react-router'
import { App } from './App'
import { BASE } from './lib/base'

export const Root = () => (
  <BrowserRouter basename={BASE}>
    <App />
  </BrowserRouter>
)
