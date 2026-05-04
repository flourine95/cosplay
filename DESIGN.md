---
name: cosplay.vn
description: Nền tảng cosplay đa vai trò - mua, thuê, đặt may trang phục chất lượng cao
colors:
  warm-amber: "oklch(0.68 0.17 60)"
  warm-amber-subtle: "oklch(0.95 0.06 70)"
  deep-indigo: "oklch(0.32 0.12 270)"
  neutral-bg: "oklch(0.99 0.004 270)"
  neutral-fg: "oklch(0.16 0.03 270)"
  neutral-muted: "oklch(0.95 0.015 270)"
  neutral-border: "oklch(0.9 0.02 270)"
typography:
  display:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(3rem, 7vw, 4.5rem)"
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 4vw, 2.25rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "Be Vietnam Pro, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.01em"
rounded:
  sm: "0.45rem"
  md: "0.6rem"
  lg: "0.75rem"
  xl: "1.05rem"
  full: "9999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
  2xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.warm-amber}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.full}"
    padding: "0.75rem 2rem"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.full}"
    padding: "0.75rem 2rem"
  card:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  input:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.neutral-fg}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1rem"
---

# Design System: cosplay.vn

## 1. Overview

**Creative North Star: "Golden Hour"**

Hệ thống thiết kế lấy cảm hứng từ ánh sáng vàng ấm của giờ vàng (golden hour) - khoảnh khắc khi ánh sáng tự nhiên làm nổi bật màu sắc một cách hoàn hảo nhất. Giao diện sạch, trung tính như một tấm canvas, để hình ảnh trang phục cosplay đầy màu sắc tỏa sáng. Màu amber ấm áp xuất hiện như điểm nhấn chiến lược, tạo cảm giác tin cậy và thân thiện mà không át đi sự sáng tạo của sản phẩm.

Thiết kế ưu tiên mobile-first nhưng đảm bảo các tác vụ phức tạp (nhập số đo, quản lý lịch thuê) vẫn mượt mà trên desktop. Mọi luồng giao dịch minh bạch, có thể theo dõi, giảm ma sát để người dùng ra quyết định nhanh - đặc biệt quan trọng khi họ có deadline sự kiện gấp.

Hệ thống tránh xa aesthetic "gamer/cyberpunk" (tối, neon, hầm hố) và template e-commerce chung chung. Thay vào đó, chúng ta xây dựng một nền tảng sạch, cởi mở, nơi cộng đồng cosplay cảm thấy được tôn vinh và an tâm.

**Key Characteristics:**

- Clean, neutral canvas làm nổi bật hình ảnh sản phẩm
- Warm amber accent tạo điểm nhấn tin cậy, không át màu
- Flat by default - tonal layering thay vì shadow
- Mobile-first responsive với desktop-optimized workflows
- Minh bạch trong mọi luồng giao dịch (cọc, tiến độ, lịch thuê)

## 2. Colors

Bảng màu tối giản với amber ấm làm điểm nhấn chính, nền trung tính tinted nhẹ về indigo để tạo độ sâu tinh tế mà không cạnh tranh với hình ảnh sản phẩm.

### Primary

- **Warm Amber** (oklch(0.68 0.17 60) / #d4a24a): Màu chủ đạo xuất hiện trên CTA chính, icon trạng thái quan trọng, và các điểm nhấn cần thu hút sự chú ý. Gợi lên cảm giác ấm áp, tin cậy như ánh sáng golden hour. Dùng tiết chế - chỉ trên các hành động quan trọng nhất (mua ngay, đặt may, xác nhận thanh toán).

- **Warm Amber Subtle** (oklch(0.95 0.06 70) / #fef8ed): Phiên bản nhạt của amber, dùng cho background của các khu vực cần nhấn mạnh nhẹ (thông báo quan trọng, highlight section) mà không át đi nội dung.

### Secondary

- **Deep Indigo** (oklch(0.32 0.12 270) / #3d3557): Màu phụ dùng cho text quan trọng, icon phụ, và các element cần độ tương phản cao. Tạo cảm giác chuyên nghiệp, ổn định.

### Neutral

- **Neutral Background** (oklch(0.99 0.004 270) / #fcfcfd): Nền chính của toàn bộ giao diện. Trắng tinted nhẹ về indigo, tạo độ ấm tinh tế mà không vàng quá.

- **Neutral Foreground** (oklch(0.16 0.03 270) / #28272e): Text chính. Gần đen nhưng tinted về indigo để hòa hợp với hệ thống màu.

- **Neutral Muted** (oklch(0.95 0.015 270) / #f3f3f5): Background cho các khu vực phụ (sidebar, card background, input disabled). Tạo phân tầng tonal nhẹ nhàng.

- **Neutral Border** (oklch(0.9 0.02 270) / #e5e4e8): Border mặc định cho card, input, divider. Tinh tế, không gây nhiễu thị giác.

### Named Rules

**The Canvas Rule.** Neutral background chiếm >80% diện tích màn hình. Màu sắc chỉ xuất hiện trên hình ảnh sản phẩm và điểm nhấn chiến lược. Giao diện là nền, sản phẩm là tâm điểm.

**The Golden Accent Rule.** Warm amber chỉ dùng cho CTA chính và trạng thái quan trọng. Nếu mọi thứ đều amber, không gì nổi bật. Sự tiết chế tạo nên sức mạnh.

## 3. Typography

**Display Font:** Be Vietnam Pro (với fallback system-ui, sans-serif)
**Body Font:** Be Vietnam Pro (với fallback system-ui, sans-serif)

**Character:** Be Vietnam Pro là một sans-serif hiện đại được thiết kế riêng cho tiếng Việt, với dấu thanh hoàn hảo và tính dễ đọc cao. Font này mang cảm giác thân thiện, cởi mở, phù hợp với tính cách "Sáng tạo - Đáng tin cậy - Cởi mở" của thương hiệu. Ấm áp hơn geometric fonts nhưng vẫn giữ được sự chuyên nghiệp. Single-font system giúp giảm tải trang và tạo sự nhất quán.

### Hierarchy

- **Display** (800, clamp(3rem, 7vw, 4.5rem), 1.05, -0.02em): Hero headlines trên trang chủ và landing pages. Extra Bold để tạo impact ngay lập tức. Chỉ dùng 1-2 lần mỗi trang.

- **Headline** (700, clamp(1.875rem, 4vw, 2.25rem), 1.1, -0.01em): Section headings chính (Đang được săn đón, Khám phá theo thể loại). Bold nhưng nhỏ hơn display.

- **Title** (600, 1.25rem, 1.3, normal): Card titles, product names, form section headers. SemiBold để phân tầng nhưng không át đi body text.

- **Body** (400, 1rem, 1.5, normal): Text chính cho mô tả, paragraph, list items. Regular weight, line-height 1.5 đảm bảo dễ đọc trên mobile. Giới hạn max-width 65-75ch cho các đoạn văn dài.

- **Label** (500, 0.875rem, 1.4, 0.01em): Form labels, metadata (giá, rating, thời gian), navigation links. Medium weight để phân biệt với body nhưng không quá nặng.

### Named Rules

**The Contrast Rule.** Tỷ lệ scale giữa Display và Body phải ≥3× trên mobile, ≥4.5× trên desktop. Hierarchy phẳng làm mất điểm nhấn.

**The Vietnamese Rule.** Be Vietnam Pro được thiết kế riêng cho tiếng Việt nên dấu thanh (ă, ê, ô, ơ, ư + 5 dấu thanh) luôn hoàn hảo. Vẫn cần kiểm tra line-height và letter-spacing để đảm bảo thoải mái.

## 4. Elevation

**Flat by default.** Hệ thống không dùng box-shadow cho elevation. Thay vào đó, chúng ta dùng tonal layering - các mức độ sáng/tối khác nhau của neutral colors để tạo độ sâu. Điều này giữ giao diện sạch, hiện đại, và giảm visual noise để hình ảnh sản phẩm nổi bật.

### Tonal Layering Strategy

- **Level 0 (Base):** `neutral-bg` (oklch 0.99) - Nền chính
- **Level 1 (Raised):** `neutral-muted` (oklch 0.95) - Cards, inputs, sidebar
- **Level 2 (Overlay):** `neutral-bg` với border `neutral-border` - Modals, dropdowns, popovers

Khi cần phân biệt rõ ràng hơn (ví dụ: modal overlay), dùng border tinh tế thay vì shadow. Hover states dùng background color shift nhẹ (±0.02 lightness) thay vì shadow.

### Named Rules

**The No-Shadow Rule.** Box-shadow bị cấm trừ khi có lý do kỹ thuật bắt buộc (ví dụ: sticky header cần tách biệt khỏi content khi scroll). Nếu cần shadow, phải xin phép và giải thích tại sao tonal layering không đủ.

**The Border-First Rule.** Khi cần tách biệt elements, thử border trước, tonal shift sau, shadow cuối cùng (và hầu như không bao giờ).

## 5. Components

### Buttons

- **Shape:** Fully rounded (9999px radius) để tạo cảm giác thân thiện, dễ tiếp cận. Không góc cạnh.
- **Primary:** Warm amber background (`oklch(0.68 0.17 60)`), dark foreground text, padding 0.75rem × 2rem. Dùng cho CTA chính (Mua ngay, Đặt may, Xác nhận).
- **Hover:** Background shift sang amber đậm hơn (`oklch(0.64 0.17 60)`), không dùng shadow. Transition 200ms ease-out.
- **Outline:** Transparent background, amber border (2px), amber text. Dùng cho secondary actions (Xem thêm, Hủy).
- **Ghost:** Transparent background, no border, muted foreground. Hover thì background shift sang `neutral-muted`. Dùng cho tertiary actions (icon buttons, subtle links).

### Cards

- **Corner Style:** Rounded-xl (1.05rem) - đủ mềm mại để thân thiện nhưng không quá tròn.
- **Background:** `neutral-bg` với border `neutral-border/60` (60% opacity để nhẹ nhàng hơn).
- **Shadow Strategy:** Không dùng shadow. Dùng border để tách biệt khỏi background.
- **Internal Padding:** 1.5rem (24px) - đủ rộng để thoải mái nhưng không lãng phí không gian trên mobile.
- **Hover:** Border opacity tăng lên 100%, background shift nhẹ sang `neutral-muted` nếu là interactive card.

### Inputs / Fields

- **Style:** Rounded-md (0.6rem), border `neutral-border`, background `neutral-bg`, padding 0.75rem × 1rem.
- **Focus:** Border color shift sang `warm-amber`, ring 2px `warm-amber/20` (subtle glow). Không dùng box-shadow đậm.
- **Error:** Border color shift sang destructive red, text helper màu đỏ bên dưới.
- **Disabled:** Background `neutral-muted`, text `neutral-muted-foreground`, cursor not-allowed.

### Navigation

- **Desktop:** Sticky header với backdrop-blur-md (glass effect nhẹ), border-bottom `neutral-border/60`. Logo trái, nav links giữa, actions phải.
- **Mobile:** Hamburger menu mở sheet từ trái. Logo và actions (search, cart, menu) trên header.
- **Links:** Label typography (0.875rem, 500 weight), `muted-foreground` mặc định, `foreground` khi hover. Active state dùng `warm-amber` text.
- **Hover:** Text color shift, không underline, không background change. Giữ sạch.

### Product Cards

- **Image:** Aspect ratio 3:4 (portrait), rounded-xl, object-cover. Hover thì scale 1.05 với transition 500ms.
- **Overlay:** Gradient từ bottom (black/75 → transparent) xuất hiện khi hover, chứa CTA buttons.
- **Badge:** Absolute top-left, rounded-full, small padding, background `card` với shadow-sm (ngoại lệ cho shadow rule vì cần tách biệt khỏi ảnh).
- **Info:** Bên dưới ảnh - series name (label size, muted), product name (title size, foreground), price (body size, bold).

### Chips / Tags

- **Style:** Rounded-full, small padding (0.5rem × 0.75rem), background `neutral-muted`, text `muted-foreground`, label typography.
- **Interactive:** Hover thì background shift sang `neutral-border`, cursor pointer.
- **Selected:** Background `warm-amber-subtle`, text `warm-amber`, border `warm-amber/20`.

## 6. Do's and Don'ts

### Do:

- **Do** dùng OKLCH cho tất cả màu sắc. Đảm bảo perceptual uniformity và dễ điều chỉnh lightness/chroma.
- **Do** giới hạn warm amber chỉ cho CTA chính và trạng thái quan trọng. Sự tiết chế tạo nên impact.
- **Do** dùng tonal layering (neutral-bg → neutral-muted → neutral-border) thay vì shadow để tạo depth.
- **Do** test mọi text với dấu tiếng Việt đầy đủ. Line-height và letter-spacing phải đủ để dấu không bị cắt.
- **Do** tối ưu lazy loading cho images. Website có rất nhiều ảnh chất lượng cao - performance là ưu tiên số 1.
- **Do** dùng rounded-full cho buttons, rounded-xl cho cards, rounded-md cho inputs. Consistency tạo nên hệ thống.
- **Do** giữ max-width 65-75ch cho body text dài. Dễ đọc hơn trên desktop.

### Don't:

- **Don't** dùng template e-commerce chung chung. Luồng thuê (lịch trống, cọc, hoàn trả) và đặt may (số đo, tiến độ) cần thiết kế riêng.
- **Don't** làm UI "gamer/cyberpunk" (tối, neon, hầm hố). Chúng ta cần UI clean, neutral để làm nổi bật hình ảnh trang phục nhiều màu sắc.
- **Don't** dùng box-shadow trừ khi có lý do kỹ thuật bắt buộc. Flat by default là nguyên tắc.
- **Don't** dùng border-left hoặc border-right >1px làm colored accent trên cards/list items. Đây là pattern lười biếng.
- **Don't** dùng gradient text (background-clip: text). Decorative, không meaningful. Dùng solid color.
- **Don't** dùng `#000` hoặc `#fff`. Tất cả neutrals phải tinted nhẹ về indigo (hue 270, chroma 0.004-0.03).
- **Don't** tạo identical card grids. Vary sizes, layouts, hoặc emphasis để tránh monotony.
- **Don't** quên test responsive behavior trên 320px-768px (mobile) và 768px-1024px (tablet). Mobile-first là ưu tiên.
