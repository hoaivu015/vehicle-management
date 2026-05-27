
interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-golden bg-ambient-gradient safe-pt safe-pb">
      <div className="w-full max-w-[480px] kraft-premium-card p-golden flex flex-col gap-golden items-center text-center">
        {/* Icon cảnh báo đẹp mắt */}
        <div className="w-16 h-16 rounded-full bg-expense/10 flex items-center justify-center text-expense">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-8 h-8"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>

        {/* Tiêu đề */}
        <h2 className="text-golden-h3 text-kraft-ink">Đã xảy ra sự cố ngoài ý muốn</h2>
        
        {/* Mô tả */}
        <p className="text-golden-body text-kraft-ink/60">
          Hệ thống gặp lỗi runtime không thể tiếp tục tải trang này. Vui lòng thử tải lại hoặc liên hệ quản trị viên.
        </p>

        {/* Khối debug lỗi - tối giản, sạch sẽ */}
        <div className="w-full bg-kraft-folder p-4 rounded-xl text-left border border-hairline-soft overflow-x-auto max-h-[120px]">
          <span className="text-apple-footnote block mb-1">Chi tiết kỹ thuật</span>
          <code className="text-[11px] font-mono text-expense break-all">
            {error.name}: {error.message}
          </code>
        </div>

        {/* Nút thao tác */}
        <button
          onClick={resetErrorBoundary}
          className="w-full liquid-button-primary active-press native-interactive mt-2 cursor-pointer"
        >
          Tải lại trang
        </button>
      </div>
    </div>
  );
}
