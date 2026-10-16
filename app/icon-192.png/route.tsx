import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#1B2632",
        }}
      >
        <div
          style={{
            width: "140px",
            height: "140px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "34px",
            backgroundColor: "rgba(255, 177, 98, 0.14)",
            border: "8px solid rgba(255, 177, 98, 0.42)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="82"
            height="82"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#FFB162"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  );
}