import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          borderRadius: 40,
          background: "linear-gradient(135deg, #6366F1 0%, #4338CA 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: 108,
            fontWeight: 900,
            fontFamily: "sans-serif",
            lineHeight: 1,
            letterSpacing: "-4px",
          }}
        >
          W
        </span>
      </div>
    ),
    size
  );
}
