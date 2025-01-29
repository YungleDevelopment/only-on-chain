import type React from "react"
import dynamic from "next/dynamic"

const Widget = dynamic(() => import("../components/Widget"), { ssr: false })

const WidgetPage: React.FC = () => {
  return <Widget />
}

export default WidgetPage

