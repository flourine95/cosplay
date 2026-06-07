# Product

## Register

product

## Users

**Khách hàng (Mua/Thuê/Đặt may):**
Gen Z và Millennials trong cộng đồng cosplay Việt Nam. Họ lướt xem và tìm ý tưởng nhanh trên mobile web mọi lúc mọi nơi, nhưng chuyển sang desktop khi cần thực hiện các tác vụ đòi hỏi độ chính xác cao (nhập số đo, chọn ngày thuê sự kiện). Tâm lý: hào hứng với sự kiện sắp tới nhưng lo lắng về deadline và việc "đồ không vừa form".

**Seller (Thợ may/Người cho thuê):**
Gồm cả xưởng chuyên nghiệp lẫn cá nhân. Cần số hóa lịch trống của trang phục (tránh trùng lịch thuê) và chuẩn hóa form nhận yêu cầu đặt may ngay trên web dashboard.

**Admin:**
Đội ngũ nội bộ thao tác chủ yếu trên desktop để kiểm duyệt bài đăng, quản lý luồng thanh toán và giải quyết tranh chấp cọc/đền bù.

## Product Purpose

Nền tảng web đa vai trò giải quyết các luồng giao dịch đặc thù của ngành cosplay tại Việt Nam: mua bán trang phục, thuê theo lịch (với quản lý cọc/hoàn trả), và đặt may theo số đo cá nhân. Thành công khi người dùng cảm thấy an tâm về chất lượng, độ vừa vặn, và minh bạch trong giao dịch; seller tiết kiệm thời gian quản lý lịch và đơn hàng; admin kiểm soát được toàn bộ marketplace.

## Brand Personality

**Sáng tạo - Đáng tin cậy - Cởi mở**

- **Sáng tạo:** Tôn vinh văn hóa và tính nghệ thuật của cộng đồng cosplay. Giao diện làm nổi bật hình ảnh trang phục đầy màu sắc, không át đi sự sáng tạo của người dùng.
- **Đáng tin cậy:** Giải quyết nỗi sợ bị lừa đảo, sai số đo. Mọi luồng xử lý (thanh toán, cọc, tiến độ may) phải minh bạch, mang lại cảm giác an tâm.
- **Cởi mở:** Thân thiện, dễ dùng cho cả người mới bắt đầu lẫn cosplayer chuyên nghiệp. Không tạo rào cản kỹ thuật hay ngôn ngữ phức tạp.

## Anti-references

**Tránh template e-commerce chung chung:**
Các template Shopify/WooCommerce chuẩn không xử lý được luồng thuê (lịch trống, cọc, hoàn trả) và đặt may (số đo, tiến độ gia công). Chúng ta cần thiết kế riêng cho các workflow này.

**Không làm UI "Gamer/Cyberpunk":**
Tránh giao diện tối, neon, hầm hố. Cosplay không chỉ là game/anime. Chúng ta cần UI clean, neutral (sạch, trung tính) để làm nền, làm nổi bật hình ảnh trang phục nhiều màu sắc thay vì cạnh tranh với chúng.

**Không quá công sở/vô hồn:**
Tránh cảm giác lạnh lùng, xa cách. Cộng đồng cosplay là về sự sáng tạo và đam mê, giao diện cần phản ánh điều đó mà không mất đi tính chuyên nghiệp.

## Design Principles

1. **Hình ảnh là trung tâm, UI là nền:**
   Trang phục cosplay đầy màu sắc và chi tiết. Giao diện phải sạch, trung tính để làm nổi bật sản phẩm, không cạnh tranh về thị giác. Tối ưu hiệu năng tải ảnh (lazy loading) là ưu tiên số 1.

2. **Minh bạch xây dựng niềm tin:**
   Mọi bước trong luồng giao dịch (đặt cọc, tiến độ may, lịch thuê/trả) phải rõ ràng, có thể theo dõi. Không có bước ẩn, không có chi phí bất ngờ. Người dùng luôn biết họ đang ở đâu trong quy trình.

3. **Mobile-first nhưng desktop-complete:**
   Thiết kế ưu tiên trải nghiệm mobile (lướt xem, tìm kiếm nhanh) nhưng đảm bảo các tác vụ phức tạp (nhập số đo, quản lý lịch thuê) vẫn mượt mà trên desktop. Responsive không chỉ là thu nhỏ, mà là tối ưu cho từng ngữ cảnh sử dụng.

4. **Giảm ma sát, tăng tốc độ quyết định:**
   Cosplayer thường có deadline gấp (sự kiện, lễ hội). Luồng mua/thuê/đặt may phải nhanh, ít bước, ít phải suy nghĩ. Học hỏi từ Shopee về tốc độ checkout, từ Etsy về cá nhân hóa đặt hàng.

5. **Chuẩn hóa không đồng nghĩa với cứng nhắc:**
   Form số đo, lịch thuê cần chuẩn hóa để dễ quản lý, nhưng vẫn cho phép ghi chú, yêu cầu đặc biệt. Hệ thống phục vụ con người, không phải ngược lại.

## Accessibility & Inclusion

**Mục tiêu:** WCAG AA

**Ưu tiên:**

- Độ tương phản chữ/nền đạt chuẩn (đặc biệt quan trọng vì nhiều hình ảnh màu sắc)
- Hỗ trợ keyboard navigation cho các form phức tạp (số đo, lịch thuê)
- Alt text đầy đủ cho hình ảnh sản phẩm (mô tả nhân vật, màu sắc, chi tiết)
- Responsive images với lazy loading tối ưu (nhiều ảnh chất lượng cao)

**Ngôn ngữ:**
Giai đoạn hiện tại: 100% tiếng Việt, dùng từ ngữ thân thiện với cộng đồng. Kiến trúc kỹ thuật (Next.js/React) đã chuẩn bị sẵn i18n để dễ dàng mở rộng sau này.

**Đặc thù kỹ thuật:**
Mobile-first responsive web design. Không phát triển native app ở giai đoạn này. Tối ưu hiệu năng tải ảnh là ưu tiên hàng đầu.
