import { ImageResponse } from "next/og";
import { getPostBySlug } from "../../lib/fs-blog";
import { SITE_NAME } from "../../lib/site";

export const alt = "Blog post preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage(props: { params: Promise<{ slug: string }> }) {
  const { slug } = await props.params;
  const post = await getPostBySlug(slug);
  const title = post.title.length > 90 ? `${post.title.slice(0, 87)}...` : post.title;
  const excerpt =
    post.excerpt.length > 140 ? `${post.excerpt.slice(0, 137)}...` : post.excerpt;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #0a0e14 0%, #1a2332 100%)",
          padding: 64,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 24,
              color: "#64b5f6",
              fontWeight: 600,
              fontFamily: "monospace",
            }}
          >
            {SITE_NAME} / blog
          </div>
          <div
            style={{
              fontSize: 56,
              fontWeight: 800,
              color: "#f0f4f8",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {title}
          </div>
          <div style={{ fontSize: 28, color: "#94a3b8", lineHeight: 1.4 }}>{excerpt}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: 22, color: "#64748b" }}>{post.readingTime}</div>
          <div style={{ fontSize: 22, color: "#64748b", fontFamily: "monospace" }}>witl.xyz</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
