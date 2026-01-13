# Bytra Light Control IoT

Hệ thống điều khiển đèn thông minh sử dụng ESP32 và Firebase Realtime Database. Dự án bao gồm firmware cho ESP32 và ứng dụng web để điều khiển đèn từ xa.

## 📋 Tổng quan

Dự án này cho phép bạn điều khiển đèn LED thông qua ESP32 kết nối với Firebase Realtime Database. Bạn có thể bật/tắt đèn từ ứng dụng web, đặt hẹn giờ tự động, và xem lịch sử hoạt động.

## 🏗️ Cấu trúc dự án

```
SmartLight/
├── bytra_light_control/    # Firmware ESP32 (PlatformIO)
│   ├── src/
│   │   └── main.cpp        # Code chính cho ESP32
│   └── platformio.ini      # Cấu hình PlatformIO
└── website/                 # Ứng dụng web React
    ├── src/
    │   ├── App.jsx          # Component chính
    │   ├── firebase.js      # Cấu hình Firebase
    │   └── main.jsx         # Entry point
    └── package.json
```

## ✨ Tính năng

### Firmware ESP32
- ✅ Kết nối WiFi tự động
- ✅ Đồng bộ với Firebase Realtime Database
- ✅ Điều khiển LED qua GPIO pin 12
- ✅ Tự động reconnect khi mất kết nối

### Ứng dụng Web
- ✅ Giao diện đẹp mắt với Tailwind CSS
- ✅ Kết nối realtime với Firebase
- ✅ Bật/tắt đèn từ xa
- ✅ Hẹn giờ tự động bật/tắt đèn
- ✅ Lịch sử hoạt động (10 bản ghi gần nhất)
- ✅ Hiển thị thời gian thực
- ✅ Responsive design (mobile & desktop)

## 🚀 Cài đặt

### Phần 1: Firmware ESP32

1. **Cài đặt PlatformIO**
   - Cài đặt [PlatformIO IDE](https://platformio.org/install/ide?install=vscode) hoặc PlatformIO Core
   - Mở project trong VS Code với extension PlatformIO

2. **Cấu hình WiFi và Firebase**
   - Mở file `bytra_light_control/src/main.cpp`
   - Cập nhật thông tin WiFi:
     ```cpp
     #define WIFI_SSID "Your_WiFi_SSID"
     #define WIFI_PASSWORD "Your_WiFi_Password"
     ```
   - Cập nhật thông tin Firebase:
     ```cpp
     #define DATABASE_URL "your-project.firebaseio.com"
     #define DATABASE_SECRET "your-database-secret"
     ```

3. **Upload code lên ESP32**
   ```bash
   cd bytra_light_control
   pio run --target upload
   ```

4. **Xem Serial Monitor**
   ```bash
   pio device monitor
   ```

### Phần 2: Ứng dụng Web

1. **Cài đặt dependencies**
   ```bash
   cd website
   npm install
   ```

2. **Cấu hình Firebase**
   - Tạo project mới trên [Firebase Console](https://console.firebase.google.com/)
   - Bật Realtime Database
   - Copy thông tin cấu hình vào `website/src/firebase.js`:
     ```javascript
     const firebaseConfig = {
       apiKey: "your-api-key",
       authDomain: "your-project.firebaseapp.com",
       databaseURL: "https://your-project.firebaseio.com",
       projectId: "your-project-id",
       storageBucket: "your-project.appspot.com",
       messagingSenderId: "123456789",
       appId: "your-app-id"
     };
     ```

3. **Cấu hình Realtime Database Rules**
   - Vào Firebase Console > Realtime Database > Rules
   - Đặt rules:
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

4. **Chạy ứng dụng**
   ```bash
   npm run dev
   ```
   - Ứng dụng sẽ chạy tại `http://localhost:5173`

## 📊 Cấu trúc Database

Dữ liệu được lưu trong Firebase Realtime Database:

```
light/
├── status: boolean          # Trạng thái đèn (true = bật, false = tắt)
├── schedules/               # Danh sách hẹn giờ
│   └── [scheduleId]/
│       ├── time: string     # Thời gian (HH:mm)
│       ├── action: string  # "on" hoặc "off"
│       ├── enabled: boolean
│       └── executed: boolean
└── history/                 # Lịch sử hoạt động
    └── [historyId]/
        ├── action: string   # "BẬT" hoặc "TẮT"
        ├── type: string     # "Thủ công" hoặc "Hẹn giờ"
        ├── timestamp: number
        └── time: string     # Thời gian định dạng vi-VN
```

## 🛠️ Công nghệ sử dụng

### Firmware
- **PlatformIO** - Build system
- **Arduino Framework** - ESP32 development
- **Firebase ESP32 Client** - Firebase integration
- **WiFi** - Network connectivity

### Website
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase Realtime Database** - Realtime database

## 📱 Cách sử dụng

### Bật/Tắt đèn thủ công
- Mở ứng dụng web
- Nhấn nút "BẬT ĐÈN" hoặc "TẮT ĐÈN"
- ESP32 sẽ tự động cập nhật trạng thái LED

### Hẹn giờ tự động
1. Chọn thời gian muốn bật/tắt đèn (định dạng HH:mm)
2. Chọn hành động: "Bật" hoặc "Tắt"
3. Nhấn nút "Thêm"
4. Hẹn giờ sẽ tự động thực thi khi đến thời gian đã đặt
5. Nhấn "✕" để xóa hẹn giờ

### Xem lịch sử
- Panel bên phải hiển thị 10 bản ghi gần nhất
- Mỗi bản ghi hiển thị: hành động, loại (Thủ công/Hẹn giờ), và thời gian

## 🔧 Cấu hình phần cứng

- **Board**: ESP32 DevKit
- **LED Pin**: GPIO 12
- **Kết nối**: 
  - LED dương cực → GPIO 12 (qua điện trở 220Ω)
  - LED âm cực → GND

## 📝 Lưu ý

- Đảm bảo ESP32 và máy tính đều kết nối cùng mạng WiFi
- Kiểm tra Firebase credentials và Database rules
- Hẹn giờ sẽ tự động reset mỗi ngày để có thể chạy lại
- Có thể mở rộng để điều khiển nhiều đèn bằng cách thêm ID cho mỗi đèn

## 📄 License

Dự án này thuộc về Bytra Technology.

## 👥 Liên hệ

- **Bytra Official**: [Website](https://bytraacademy.com)
- **Hotline**: 0968384643

---

Made with ❤️ by Bytra Technology
