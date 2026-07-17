import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main
      style={{
        flex: 1,
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 20px",
        background:
          "linear-gradient(180deg, rgba(0, 0, 0, 1) 0%, rgba(10, 10, 10, 1) 100%)",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "560px",
          padding: "40px 32px",
          borderRadius: "24px",
          border: "1px solid rgba(255, 255, 255, 0.1)",
          backgroundColor: "rgba(255, 255, 255, 0.04)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.45)",
          textAlign: "center",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            fontWeight: 700,
            letterSpacing: "0.08em",
            color: "#a1a1aa",
          }}
        >
          404 NOT FOUND
        </p>
        <h1
          style={{
            margin: "16px 0 0",
            fontSize: "32px",
            lineHeight: 1.2,
            color: "#ffffff",
          }}
        >
          요청한 게시물을 찾을 수 없습니다.
        </h1>
        <p
          style={{
            margin: "16px 0 0",
            fontSize: "16px",
            lineHeight: 1.6,
            color: "#a1a1aa",
          }}
        >
          이미 삭제되었거나 잘못된 주소로 접근한 것일 수 있습니다.
        </p>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "12px",
            marginTop: "28px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/posts"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "148px",
              padding: "12px 18px",
              borderRadius: "999px",
              backgroundColor: "#ffffff",
              color: "#111111",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            게시물 목록으로
          </Link>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              minWidth: "148px",
              padding: "12px 18px",
              borderRadius: "999px",
              backgroundColor: "transparent",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 700,
              border: "1px solid rgba(255, 255, 255, 0.18)",
            }}
          >
            홈으로
          </Link>
        </div>
      </section>
    </main>
  );
}
