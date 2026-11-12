"use client";

// Thay thế cả root layout khi lỗi, nên không dùng antd/provider ở đây.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: 48, textAlign: "center" }}>
        <h2>Ứng dụng gặp lỗi nghiêm trọng</h2>
        <button type="button" onClick={retry}>
          Thử lại
        </button>
      </body>
    </html>
  );
}
