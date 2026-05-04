# cosplay-ui

Website cosplay được xây dựng bằng **Next.js**, **React** và **Tailwind CSS**.

## Bắt đầu

### Cài đặt dependencies

Sau khi clone project về, chạy lệnh:

```bash
npm ci
```

Lệnh này cài đặt chính xác theo `package-lock.json`, đảm bảo mọi người trong team có cùng phiên bản thư viện. Nhanh hơn và tránh conflict không đáng có.

**Khi nào dùng `npm install`?**  
Chỉ khi bạn cần thêm/xóa/cập nhật package mới. Lệnh này sẽ thay đổi `package-lock.json`, nhớ commit cả file này lên.

### Chạy development server

```bash
npm run dev
```

Mở trình duyệt và vào `http://localhost:3000` để xem kết quả. Code thay đổi sẽ tự động reload.

### Build production

Khi cần deploy hoặc test bản production:

```bash
npm run build
npm run start
```

Lệnh `build` sẽ tối ưu code, sau đó `start` chạy server production.
