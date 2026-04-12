# Hướng dẫn thiết lập Vercel cho Auto28

Để đảm bảo ứng dụng chạy mượt mà trên Vercel, vui lòng thực hiện các bước sau:

## 1. Cấu hình Biến môi trường (Environment Variables)

Truy cập **Vercel Dashboard** > **Project Settings** > **Environment Variables** và thêm các biến sau:

| Tên biến | Giải thích | Lấy ở đâu? |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Link API của Supabase | Dashboard Supabase > Project Settings > API |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | Key Anon của Supabase | Dashboard Supabase > Project Settings > API |
| `VITE_CLOUDINARY_CLOUD_NAME` | Cloud Name của Cloudinary | Dashboard Cloudinary |
| `VITE_CLOUDINARY_API_KEY` | API Key của Cloudinary | Dashboard Cloudinary |
| `VITE_CLOUDINARY_API_SECRET` | API Secret của Cloudinary | Dashboard Cloudinary |
| `VITE_CLOUDINARY_UPLOAD_PRESET` | Preset để upload ảnh | Settings > Upload > Upload presets |

> [!IMPORTANT]
> Hãy chắc chắn rằng bạn đã copy chính xác các tên biến như trên (đặc biệt là tiền tố `NEXT_PUBLIC_` và `VITE_`).

## 2. Kiểm tra Routing

Tôi đã thêm file `vercel.json` vào gốc dự án. File này giúp xử lý lỗi 404 khi bạn tải lại trang (F5) khi đang ở trong một trang con (vd: `/inventory`). Bạn không cần làm gì thêm.

## 3. Triển khai (Deploy)

Nếu bạn đã kết nối dự án với GitHub/GitLab, bạn chỉ cần:
```bash
git add .
git commit -m "chore: prepare for vercel deployment"
git push
```
Vercel sẽ tự động thực hiện quá trình build và deploy.

---
*Chúc bạn triển khai thành công!*
