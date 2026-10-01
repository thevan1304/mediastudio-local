# 🎬 GIF Background Remover & Video Studio

> **Bộ công cụ xử lý Ảnh, GIF & Video đa năng chạy 100% trên trình duyệt (Client-side)**  
> Không cần máy chủ · Không giới hạn kích thước · Bảo mật riêng tư tuyệt đối · Hoàn toàn miễn phí.

---

## 📌 Giới thiệu

**GIF Background Remover & Video Studio** là ứng dụng web toàn diện giúp bạn dễ dàng xóa nền ảnh/GIF, can thiệp chỉnh sửa từng khung hình (frame-by-frame), chuyển đổi video sang GIF chất lượng cao, tắt tiếng video và tạo ảnh động từ ảnh tĩnh. Toàn bộ quá trình tính toán và render diễn ra ngay trên máy tính của bạn thông qua **WebAssembly (FFmpeg)** và **Web Workers**, đảm bảo dữ liệu không bao giờ bị tải lên bất kỳ máy chủ nào.

---

## ✨ Tính năng nổi bật

### 1. 🪄 Xóa nền Ảnh & GIF (Background Remover)
- **Tự động nhận diện màu nền**: Tự động lấy mẫu màu từ 4 góc và các đường viền ảnh/GIF để tách nền mượt mà.
- **Tùy chỉnh thông số chuyên sâu**:
  - **Độ nhạy màu (Tolerance)**: Điều chỉnh dải màu cần xóa.
  - **Làm mịn viền (Feather)**: Khử viền răng cưa, tạo chuyển tiếp mờ tự nhiên.
  - **Xóa lỗ hổng (Island Gaps)**: Xóa các vùng màu nền bị lọt thỏm bên trong vật thể (kẽ tay, nách, khoảng trống giữa chân,...).
- **Click xóa nền thủ công**: Click trực tiếp lên vùng màu còn sót trên khung hình gốc để xóa sạch triệt để.
- **Nén & Tối ưu GIF**:
  - Hỗ trợ 5 mức nén (Không nén, Nhẹ, Trung bình, Mạnh, Tối đa) giúp giảm đến 70-90% dung lượng file.
  - Tùy chỉnh tốc độ phát lại GIF từ `0.25x` đến `3.0x`.

### 2. 🎞️ Sửa từng Frame (Frame-by-Frame Studio)
- **Filmstrip Timeline**: Liệt kê toàn bộ danh sách các khung hình của GIF với độ trễ (delay) hiển thị chi tiết.
- **Bộ công cụ vẽ & xóa chuyên nghiệp**:
  - **🪄 Magic Wand (Click xóa vùng)**: Thuật toán Flood Fill xóa sạch vùng màu đồng nhất chỉ với 1 cú click.
  - **🖌️ Bút tẩy (Eraser)**: Tẩy xóa chi tiết với kích thước nét cọ tùy chỉnh (`3px` – `50px`).
- **🌐 Áp dụng cho mọi Frame**: Tự động xóa vùng màu tại cùng một tọa độ trên **tất cả** các khung hình chỉ bằng 1 thao tác.
- **Màn hình làm việc cỡ lớn & Thu phóng siêu nét**:
  - Chế độ mở rộng **Wide Mode** (`1260px`) với chiều cao màn hình `560px` cực kỳ thoáng đãng.
  - **Pixelated Sharp Rendering**: Hiển thị pixel góc cạnh, sắc nét từng điểm ảnh (không bị mờ hạt).
  - Tùy chọn thu phóng đa dạng: `To vừa khung (Fit)`, `100% (Gốc)`, `150%`, `200%`, `300%`, `400%`, nút `+` / `−`.
  - **Điều hướng linh hoạt**: Giữ `Ctrl` + Cuộn chuột để Zoom; Giữ `Space` (phím cách) hoặc ấn chuột giữa để kéo màn hình (Pan).
- **Hoàn tác & Khôi phục**: Hỗ trợ `Ctrl + Z` (Undo) từng bước và khôi phục frame ban đầu.

### 3. 📹 Video sang GIF (Video to GIF Converter)
- Chuyển đổi video định dạng **MP4, WebM, MOV** thành GIF động mượt mà bằng **FFmpeg WebAssembly**.
- **Cắt xén thời lượng linh hoạt**:
  - Cắt nhanh: Toàn bộ, 3 giây đầu, 5 giây đầu.
  - Tùy chỉnh chính xác: Nhập số giây bắt đầu (`Start Time`) và số giây kết thúc (`End Time`).
- **Tùy chọn độ phân giải & FPS**:
  - Kích thước: Giữ nguyên gốc, Thu nhỏ 75%, 50%, hoặc 30% (~240p siêu nhẹ).
  - Khung hình: 10 FPS, 15 FPS, 20 FPS.
- **Dự toán dung lượng**: Dự đoán dung lượng file GIF đầu ra theo thời gian thực trước khi bấm tạo.

### 4. 🔇 Xóa âm thanh Video (Mute Video)
- Loại bỏ toàn bộ âm thanh khỏi video MP4 / WebM / MOV.
- Sử dụng cơ chế `-c:v copy -an` của FFmpeg: **giữ nguyên 100% chất lượng video gốc mà không cần nén lại (re-encode)**, thời gian xử lý gần như tức thì.
- Tích hợp trình phát video để nghe/xem lại ngay trên trình duyệt trước khi tải xuống.

### 5. 🖼️ Ghép Ảnh sang GIF (Images to GIF)
- Ghép nhiều ảnh tĩnh (JPG, PNG, WebP) thành một tệp GIF sinh động.
- Dễ dàng kéo thả sắp xếp thứ tự các khung hình, thêm bớt ảnh, chỉnh thời gian trễ giữa các ảnh.

### 6. ✨ Tạo hiệu ứng động (Animate)
- Biến ảnh tĩnh thành GIF chuyển động vui nhộn với 5 hiệu ứng cài sẵn:
  - 🌊 **Lắc lư (Wobble)**
  - 💓 **Nhịp tim (Pulse)**
  - 🏀 **Nảy lên (Bounce)**
  - 🔄 **Xoay tròn (Spin)**
  - 🎈 **Bay bổng (Float)**
- Tự do tinh chỉnh tốc độ và biên độ hiệu ứng (Intensity).

---

## 🛠️ Công nghệ sử dụng

- **Core**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 (Custom Properties, Glassmorphism, Neon glow).
- **Xử lý đa phương tiện**:
  - **[FFmpeg WebAssembly (@ffmpeg/ffmpeg)](https://ffmpegwasm.netlify.app/)**: Xử lý, cắt xén, trích xuất khung hình video và loại bỏ audio hoàn toàn offline.
  - **[gif.js](https://github.com/jnordberg/gif.js)**: Bộ mã hóa GIF hiệu năng cao sử dụng Web Workers đa luồng.
  - **[libgif-js (SuperGif)](https://github.com/buzzfeed/libgif-js)**: Giải mã và đọc từng frame cùng bảng màu của file GIF.
- **Không có Backend phụ thuộc**: Chạy dưới dạng Static Web Application, tương thích với GitHub Pages, Vercel, Netlify hoặc bất kỳ web server tĩnh nào.

---

## 🚀 Hướng dẫn cài đặt & Chạy cục bộ

### Yêu cầu môi trường
- [Node.js](https://nodejs.org/) (phiên bản 16 trở lên khuyến nghị).
- Một trình duyệt hiện đại (Chrome, Edge, Firefox, Brave, Safari) hỗ trợ WebAssembly và SharedArrayBuffer.

### Các bước thực hiện

1. **Clone repository về máy**:
   ```bash
   git clone https://github.com/thevan1304/mediastudio-local.git
   cd mediastudio-local
   ```

2. **Cài đặt các gói phụ thuộc**:
   ```bash
   npm install
   ```

3. **Đóng gói sản phẩm (Build)**:
   ```bash
   npm run build
   ```
   *Lệnh này sẽ tạo thư mục `./dist` chứa toàn bộ mã nguồn, tài nguyên tĩnh và WebAssembly sẵn sàng để triển khai.*

4. **Khởi chạy ứng dụng**:
   - **Chế độ phát triển (Development với tự động cập nhật khi đổi code)**:
     ```bash
     npm run dev
     ```
   - **Chế độ chạy chính thức (Production Server)**:
     ```bash
     npm run start
     ```

5. **Truy cập ứng dụng**:
   Mở trình duyệt và truy cập vào đường dẫn:
   ```
   http://localhost:3000
   ```

---

## ⌨️ Phím tắt & Thao tác nhanh trong Frame Studio

| Phím / Thao tác | Chức năng |
| :--- | :--- |
| **`Click chuột trái`** | Xóa vùng màu (với Magic Wand) hoặc Tẩy điểm ảnh (với Bút tẩy) |
| **`Phím ←` / `Phím →`** | Chuyển đổi qua lại giữa Frame trước và Frame sau |
| **`Ctrl + Z`** | Hoàn tác (Undo) thao tác vừa thực hiện trên frame hiện tại |
| **`Ctrl + Cuộn chuột`** | Phóng to (Zoom In) / Thu nhỏ (Zoom Out) màn hình vẽ |
| **`Giữ Space + Rê chuột`** | Kéo và di chuyển góc nhìn (Pan) khi đang zoom lớn |
| **`Nhấn giữ Chuột giữa`** | Kéo di chuyển góc nhìn nhanh (Pan) |

---

## 🔒 Cam kết bảo mật & Quyền riêng tư

- **100% Client-Side Processing**: Toàn bộ tệp tin hình ảnh, GIF và video tải lên đều được xử lý trực tiếp trong bộ nhớ RAM trình duyệt của bạn thông qua Web Workers và WebAssembly.
- Không có bất kỳ hình ảnh, video hay dữ liệu cá nhân nào được gửi đến máy chủ bên ngoài.
