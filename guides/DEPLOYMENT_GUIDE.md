# Hướng Dẫn Triển Khai — Auto28

> Tài liệu này hướng dẫn đầy đủ quy trình triển khai (deploy) ứng dụng Auto28 lên **Vercel**.

---

## 1. Cấu Hình Biến Môi Trường

Truy cập **Vercel Dashboard → Project Settings → Environment Variables** và thêm các biến sau:

| Tên biến | Giải thích | Lấy ở đâu? |
|:---|:---|:---|
| `NEXT_PUBLIC_SUPABASE_URL` | Link API của Supabase | Dashboard Supabase → Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Key Anon của Supabase | Dashboard Supabase → Project Settings → API |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud Name của Cloudinary | Dashboard Cloudinary |
| `VITE_CLOUDINARY_API_KEY` | API Key của Cloudinary | Dashboard Cloudinary |
| `VITE_CLOUDINARY_API_SECRET` | API Secret của Cloudinary | Dashboard Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Preset để upload ảnh | Settings → Upload → Upload presets |

> [!IMPORTANT]
> Sao chép chính xác tên biến (đặc biệt tiền tố `NEXT_PUBLIC_` và `VITE_`). Có thể copy từ file `.env` trong thư mục dự án.

---

## 2. Triển Khai (Deploy)

### Cách 1: Tự động qua Git (Khuyến nghị)

Nếu dự án đã kết nối với GitHub/GitLab, chỉ cần push code:

```bash
git add .
git commit -m "chore: deploy update"
git push
```

Vercel sẽ tự động build và deploy sau mỗi lần push lên branch `main`.

### Cách 2: Deploy thủ công qua CLI

```bash
# Đăng nhập Vercel (chỉ cần 1 lần)
npx vercel login

# Deploy lên production
npx vercel --prod
```

> [!TIP]
> Sau khi deploy, Vercel cung cấp URL dạng `https://auto28-app.vercel.app` để kiểm tra kết quả.

---

## 3. Kiểm Tra Sau Khi Deploy

- [ ] Trang chủ `/` load đúng, không lỗi console.
- [ ] Đăng nhập hoạt động (kết nối Supabase thành công).
- [ ] Upload ảnh xe hoạt động (kết nối Cloudinary thành công).
- [ ] F5 tại các trang con (vd: `/inventory`) không bị lỗi 404 (đã xử lý qua `vercel.json`).
- [ ] Không có lỗi hydration hay runtime errors trong console.

---

## 4. Ghi Chú Kỹ Thuật

- File `vercel.json` trong root dự án xử lý SPA routing — tránh lỗi 404 khi reload trang con.
- Ứng dụng sử dụng **Supabase Row Level Security (RLS)** — đảm bảo RLS policy được kích hoạt trên Supabase Dashboard.
- Biến môi trường `VITE_*` chỉ có tác dụng trong môi trường local (Vite dev server). Trên Vercel, cần dùng prefix tương ứng nếu migrate sang Next.js env vars.

---

*Tài liệu này thay thế: `HUONG_DAN_VERCEL.md` và `VERCEL_SETUP.md`.*  
*Phiên bản: 1.0 — Tổng hợp ngày 25/04/2026*
