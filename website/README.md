# Smart Light Control Website

Ứng dụng web đơn giản để điều khiển bật/tắt đèn sử dụng React.js, Tailwind CSS và Firebase Realtime Database.

## Tính năng

- ✅ Giao diện đẹp mắt với Tailwind CSS
- ✅ Kết nối realtime với Firebase Realtime Database
- ✅ Tự động cập nhật trạng thái đèn theo thời gian thực
- ✅ **Hiển thị thời gian thực** - Cập nhật mỗi giây
- ✅ **Hẹn giờ bật/tắt đèn** - Đặt lịch tự động bật/tắt đèn
- ✅ **Lịch sử hoạt động** - Xem lại các lần bật/tắt đèn
- ✅ Responsive design, hoạt động tốt trên mobile và desktop
- ✅ Tất cả tính năng hiển thị trong 1 màn hình

## Cài đặt

1. Cài đặt dependencies:
```bash
npm install
```

2. Cấu hình Firebase:
   - Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
   - Bật Realtime Database trong Firebase Console
   - Copy thông tin cấu hình Firebase vào file `src/firebase.js`
   - Cập nhật các giá trị:
     - `apiKey`
     - `authDomain`
     - `databaseURL`
     - `projectId`
     - `storageBucket`
     - `messagingSenderId`
     - `appId`

3. Cấu hình Realtime Database Rules:
   - Vào Firebase Console > Realtime Database > Rules
   - Đặt rules để cho phép đọc/ghi:
   ```json
   {
     "rules": {
       "light": {
         ".read": true,
         ".write": true
       }
     }
   }
   ```

## Chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại `http://localhost:5173`

## Build cho production

```bash
npm run build
```

## Cấu trúc Database

Dữ liệu được lưu trong Firebase Realtime Database với cấu trúc:
```
light/
  ├── status: boolean (true = bật, false = tắt)
  ├── schedules/
  │   └── [scheduleId]/
  │       ├── time: string (HH:mm)
  │       ├── action: string ("on" hoặc "off")
  │       ├── enabled: boolean
  │       └── executed: boolean
  └── history/
      └── [historyId]/
          ├── action: string ("BẬT" hoặc "TẮT")
          ├── type: string ("Thủ công" hoặc "Hẹn giờ")
          ├── timestamp: number
          └── time: string (thời gian định dạng vi-VN)
```

## Công nghệ sử dụng

- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase Realtime Database** - Realtime database

## Cách sử dụng

### Bật/Tắt đèn thủ công
- Nhấn nút "BẬT ĐÈN" hoặc "TẮT ĐÈN" để điều khiển đèn ngay lập tức

### Hẹn giờ
1. Chọn thời gian muốn bật/tắt đèn (định dạng HH:mm)
2. Chọn hành động: "Bật" hoặc "Tắt"
3. Nhấn nút "Thêm" để thêm hẹn giờ
4. Hẹn giờ sẽ tự động thực thi khi đến thời gian đã đặt
5. Nhấn "✕" để xóa hẹn giờ không cần thiết

### Xem lịch sử
- Panel bên phải hiển thị 10 bản ghi gần nhất
- Mỗi bản ghi hiển thị: hành động (BẬT/TẮT), loại (Thủ công/Hẹn giờ), và thời gian

## Lưu ý

- Đảm bảo đã cấu hình đúng Firebase credentials
- Kiểm tra Realtime Database rules để đảm bảo quyền truy cập
- Hẹn giờ sẽ tự động reset mỗi ngày để có thể chạy lại
- Có thể mở rộng để điều khiển nhiều đèn bằng cách thêm ID cho mỗi đèn
