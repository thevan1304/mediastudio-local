# 🎬 GIF Background Remover & Video Studio

> **Bộ công cụ xử lý ảnh, GIF và video ngay trong trình duyệt.**
> Tệp được xử lý trên máy của bạn; cần kết nối mạng để tải một số thư viện từ CDN.

---

## 📌 Giới thiệu

**GIF Background Remover & Video Studio** giúp xóa nền ảnh/GIF, chỉnh sửa từng khung hình GIF, ghép ảnh thành GIF, chuyển video sang GIF và tắt tiếng video. Việc xử lý tệp diễn ra trong trình duyệt bằng Canvas, Web Workers và FFmpeg WebAssembly (cho tính năng tắt tiếng video).

---

## ✨ Tính năng nổi bật

### 1. 🪄 Xóa nền Ảnh & GIF (Background Remover)
- **Tự động nhận diện màu nền**: Tự động lấy mẫu màu từ 4 góc và các đường viền ảnh/GIF để tách nền mượt mà.
- **Tùy chỉnh thông số chuyên sâu**:
  - **Độ nhạy màu (Tolerance)**: Điều chỉnh dải màu cần xóa.
  - **Làm mịn viền (Feather)**: Khử viền răng cưa, tạo chuyển tiếp mờ tự nhiên.
- **Click xóa nền thủ công**: Click vào vùng nền bị bao kín trên ảnh gốc để bổ sung điểm bắt đầu xóa.
- **Nén & Tối ưu GIF**:
  - Hỗ trợ 5 mức nén bằng cách thay đổi kích thước, chất lượng mã hóa và số khung hình giữ lại.
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
- Lấy khung hình từ video bằng trình phát video và Canvas, sau đó mã hóa GIF bằng **gif.js**. Các định dạng video dùng được phụ thuộc vào khả năng giải mã của trình duyệt.
- **Cắt xén thời lượng linh hoạt**:
  - Cắt nhanh: Toàn bộ, 3 giây đầu, 5 giây đầu.
  - Tùy chỉnh chính xác: Nhập số giây bắt đầu (`Start Time`) và số giây kết thúc (`End Time`).
- **Tùy chọn độ phân giải & FPS**:
  - Kích thước: Giữ nguyên, phóng lên 2×/4×, hoặc thu nhỏ còn 50%/30%; có tùy chọn tăng độ nét.
  - Tốc độ khung hình: 1–20 FPS.
- **Dự toán dung lượng**: Hiển thị ước tính dung lượng GIF trước khi tạo.

### 4. 🔇 Xóa âm thanh Video (Mute Video)
- Loại bỏ toàn bộ âm thanh khỏi video MP4 / WebM / MOV.
- Sử dụng `-c:v copy -an` của FFmpeg WebAssembly để giữ nguyên luồng hình ảnh và bỏ âm thanh, không mã hóa lại video.
- Tích hợp trình phát video để nghe/xem lại ngay trên trình duyệt trước khi tải xuống.

### 5. 🖼️ Ghép Ảnh sang GIF (Images to GIF)
- Tạo GIF từ ảnh gốc hoặc ghép nhiều ảnh tĩnh (JPG, PNG, WebP).
- Với nhiều ảnh, có thể kéo thả đổi thứ tự, thêm bớt ảnh và chỉnh thời gian hiển thị mỗi ảnh.

---

## 🛠️ Công nghệ sử dụng

- **Core**: HTML5, Vanilla JavaScript (ES6+), Vanilla CSS3 (Custom Properties, Glassmorphism, Neon glow).
- **Xử lý đa phương tiện**:
  - **[FFmpeg WebAssembly (@ffmpeg/ffmpeg)](https://ffmpegwasm.netlify.app/)**: Loại bỏ âm thanh khỏi video ngay trong trình duyệt.
  - **[gif.js](https://github.com/jnordberg/gif.js)**: Bộ mã hóa GIF hiệu năng cao sử dụng Web Workers đa luồng.
  - **[libgif-js (SuperGif)](https://github.com/buzzfeed/libgif-js)**: Giải mã và đọc từng frame cùng bảng màu của file GIF.
- **Máy chủ tĩnh**: `server.js` phục vụ các tệp ứng dụng và thiết lập header cho WebAssembly/SharedArrayBuffer; không có API tải tệp lên.
- **Tài nguyên CDN**: Trang tải `libgif`, `gif.js`, GIF worker, Google Fonts và ảnh cờ từ dịch vụ bên ngoài. Vì vậy ứng dụng hiện chưa hoạt động đầy đủ khi ngắt mạng.

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

- Ảnh, GIF và video được chọn được xử lý trong trình duyệt; mã nguồn hiện tại không có chức năng tải các tệp đó lên máy chủ.
- Khi mở ứng dụng hoặc tạo GIF, trình duyệt tải một số thư viện và tài nguyên giao diện từ CDN. Dung lượng tệp xử lý được phụ thuộc vào bộ nhớ và khả năng của trình duyệt.
