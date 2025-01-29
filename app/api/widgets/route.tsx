import { NextResponse } from "next/server";
import { renderToString } from "react-dom/server";
import WalletConnector from "@/components/WalletConnector";
import UploadWidget from "@/components/UploadWidget";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const widget = searchParams.get("widget");

  let content = "";
  if (widget === "wallet") {
    content = renderToString(<WalletConnector />);
  } else if (widget === "upload") {
    content = renderToString(<UploadWidget />);
  } else {
    return NextResponse.json({ error: "Widget not found" }, { status: 404 });
  }

  return NextResponse.json({ content });
}
