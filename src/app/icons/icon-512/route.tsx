import { ImageResponse } from "next/og";

export const runtime = "edge";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          borderRadius: 100,
          background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 308,
            fontWeight: 900,
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: "-12px",
          }}
        >
          W
        </span>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
