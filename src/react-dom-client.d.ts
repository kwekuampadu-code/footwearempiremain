declare module 'react-dom/client' {
  import type { ComponentType, ReactNode } from 'react';
  export type Root = {
    render(children: ReactNode): void
  }
  export function createRoot(container: Element | DocumentFragment): Root
}
