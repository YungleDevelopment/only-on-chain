import WidgetsPage from "./widgets/page"

// Export for direct usage
export { WidgetsPage }

// Also expose globally for script tag usage
if (typeof window !== "undefined") {
  ;(window as typeof globalThis & { WidgetsPage?: typeof WidgetsPage }).WidgetsPage = WidgetsPage
}

