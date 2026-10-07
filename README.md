# 🎬 GIF Background Remover & Video Studio

> **Bộ công cụ xử lý ảnh, GIF và video ngay trong trình duyệt.**
> Tệp được xử lý trên máy của bạn. Sau khi cài dependency, ứng dụng chạy trên localhost không cần kết nối mạng.

---

## 📌 Giới thiệu

**GIF Background Remover & Video Studio** giúp xóa nền ảnh/GIF, chỉnh sửa từng khung hình GIF, ghép ảnh thành GIF, chuyển video sang GIF, cắt/ghép video và tắt tiếng video. Việc xử lý tệp diễn ra trong trình duyệt bằng Canvas, Web Workers và FFmpeg WebAssembly.

---

## ✨ Tính năng nổi bật

### 1. 🪄 Xóa nền Ảnh & GIF (Background Remover)
- **Tự động nhận diện màu nền**: Tự động lấy mẫu màu từ 4 góc và các đường viền ảnh/GIF để tách nền mượt mà.
- **Tùy chỉnh thông số chuyên sâu**:
  - **Độ nhạy màu (Tolerance)**: Điều chỉnh dải màu cần xóa.
  - **Làm mịn viền (Feather)**: Khử viền răng cưa, tạo chuyển tiếp mờ tự nhiên.
- **Click xóa nền thủ công**: Click vào vùng nền bị bao kín trên ảnh gốc để bổ sung điểm bắt đầu xóa.
- **Xuất ảnh tĩnh**: Chọn PNG/WebP có nền trong suốt hoặc JPEG với nền trắng.
- **Xử lý hàng loạt**: Chọn nhiều ảnh bằng nút tải tệp chính hoặc kéo thả nhiều ảnh, xóa nền theo cùng bộ thông số và tải các PNG kết quả trong một tệp ZIP.
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
- **Sắp xếp và thời gian**: Kéo thả đổi thứ tự frame, chỉnh thời gian hiển thị từng frame trước khi xuất.
- **Thêm chữ vào GIF**: Nhập chữ, chọn cỡ, màu và vị trí trên mọi frame; xem trước trước khi xuất.

### 3. 📹 Video sang GIF (Video to GIF Converter)
- Lấy khung hình từ video bằng trình phát video và Canvas, sau đó mã hóa GIF bằng **gif.js**. Các định dạng video dùng được phụ thuộc vào khả năng giải mã của trình duyệt.
- **Cắt xén thời lượng linh hoạt**:
  - Cắt nhanh: Toàn bộ, 3 giây đầu, 5 giây đầu.
  - Tùy chỉnh chính xác: Nhập số giây bắt đầu (`Start Time`) và số giây kết thúc (`End Time`).
- **Tùy chọn độ phân giải & FPS**:
  - Kích thước: Giữ nguyên, phóng lên 2×/4×, hoặc thu nhỏ còn 50%/30%; có tùy chọn tăng độ nét.
  - Tốc độ khung hình: 1–20 FPS.
- **Dự toán dung lượng**: Hiển thị ước tính dung lượng GIF trước khi tạo.

### Tùy chọn chung khi xuất
- Có thể hủy tác vụ đang xử lý bằng nút **Hủy xử lý**.

### 4. ✂️ Sửa Video (Edit Video)
- Cắt video trên thanh thời gian có ảnh khung hình: kéo hai tay nắm để chọn đoạn, kéo đầu phát trắng để tua, phát/tạm dừng và phóng to/thu nhỏ timeline. Có thể dùng phím mũi tên khi chọn tay nắm hoặc đầu phát để chỉnh chính xác.
- Ghép tối đa 8 clip (tổng không quá 250 MB) trên dải thời gian có thước, nút phát và đầu phát kéo để xem trước. Kéo trực tiếp clip đến trước, sau hoặc giữa các clip khác; kéo hai mép tím của từng clip để chọn phần cần giữ trước khi xuất MP4. Các clip được chuẩn hóa về cùng kích thước, 30 FPS, H.264/AAC; clip không có tiếng được thêm âm thanh im lặng để ghép ổn định.
- Hoàn tác/làm lại các thao tác cắt, thêm/xóa và sắp xếp clip trong phần sửa video.
- Chọn kích thước gốc hoặc giới hạn 720p/480p cùng mức chất lượng trước khi xuất MP4.
- Xem trước và tải video kết quả. Việc mã hóa diễn ra trên máy nên thời gian xử lý phụ thuộc vào độ dài clip và thiết bị.

### 5. 🔇 Xóa âm thanh Video (Mute Video)
- Loại bỏ toàn bộ âm thanh khỏi video MP4 / WebM / MOV.
- Sử dụng `-c:v copy -an` của FFmpeg WebAssembly để giữ nguyên luồng hình ảnh và bỏ âm thanh, không mã hóa lại video.
- Tích hợp trình phát video để nghe/xem lại ngay trên trình duyệt trước khi tải xuống.

### 6. 🖼️ Ghép Ảnh sang GIF (Images to GIF)
- Tạo GIF từ ảnh gốc hoặc ghép nhiều ảnh tĩnh (JPG, PNG, WebP).
- Với nhiều ảnh, có thể kéo thả đổi thứ tự, thêm bớt ảnh và chỉnh thời gian hiển thị mỗi ảnh.

---

## 🛠️ Công nghệ sử dụng

- **Core**: React, TypeScript, Vite và CSS3.
- **Xử lý đa phương tiện**:
  - **[FFmpeg WebAssembly (@ffmpeg/ffmpeg)](https://ffmpegwasm.netlify.app/)**: Cắt, ghép và loại bỏ âm thanh video ngay trong trình duyệt.
  - **[gif.js](https://github.com/jnordberg/gif.js)**: Bộ mã hóa GIF hiệu năng cao sử dụng Web Workers đa luồng.
  - **[libgif-js (SuperGif)](https://github.com/buzzfeed/libgif-js)**: Giải mã và đọc từng frame cùng bảng màu của file GIF.
- **Máy chủ**: Vite phục vụ ứng dụng khi phát triển; `server.js` phục vụ bản build trong `dist/`. Cả hai thiết lập header cho WebAssembly/SharedArrayBuffer; không có API tải tệp lên.
- **Tài nguyên cục bộ**: `libgif`, `gif.js`, GIF worker và ảnh cờ được phục vụ từ project. Giao diện dùng font hệ thống để hoạt động khi ngắt mạng.

---

## 📁 Cấu trúc dự án

```text
src/
  components/           Thành phần giao diện React
  features/background/  Thuật toán xóa nền
  features/gif/         Xử lý độ trong suốt của GIF
  features/studio/      Các quy trình xử lý ảnh, GIF và video
  features/video/       Cắt và ghép video bằng FFmpeg
  locales/               Nội dung tiếng Anh và tiếng Việt
  pages/                 Trang ứng dụng và giao diện các công cụ
  styles/                CSS của ứng dụng
  utils/                 Tiện ích tạo tệp ZIP
  main.tsx               Điểm khởi chạy React
public/
  ffmpeg/                FFmpeg WebAssembly và worker
  vendor/                Thư viện GIF và giấy phép
  flags/                 Ảnh cờ giao diện
index.html               Trang gốc của Vite
vite.config.mts          Cấu hình máy chủ phát triển
server.js                Máy chủ phục vụ bản build
```

Giao diện công cụ hiện được gắn trong trang React, còn các thao tác chỉnh sửa media được tổ chức trong các module TypeScript. Các thư viện GIF được phục vụ từ thư mục `public/vendor/`.

---

## 🚀 Hướng dẫn cài đặt & Chạy cục bộ

### Yêu cầu môi trường
- [Node.js](https://nodejs.org/) phiên bản 20.19 trở lên hoặc 22.12 trở lên.
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
   Bước cài đặt đầu tiên cần mạng nếu máy chưa có sẵn các gói npm. Sau đó ứng dụng không cần mạng khi chạy và xử lý tệp.

3. **Chạy khi phát triển**:
   ```bash
   npm run dev
   ```

4. **Đóng gói và chạy bản chính thức**:
   ```bash
   npm run build
   npm run start
   ```
   Bản build nằm trong `dist/` cùng các tài nguyên FFmpeg WebAssembly.

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
- Khi mở ứng dụng hoặc tạo GIF, trình duyệt tải thư viện và tài nguyên giao diện từ máy chủ localhost. Dung lượng tệp xử lý phụ thuộc vào bộ nhớ và khả năng của trình duyệt.
