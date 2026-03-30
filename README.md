# ZChat AI - Android App

Ứng dụng chat AI cho Android, build với **Capacitor + Next.js**.

## ✨ Tính năng

- 🤖 **AI Chat thông minh** - Trả lời bằng tiếng Việt, thân thiện như người bạn
- 📱 **Native Android APK** - Cài đặt trực tiếp như app thông thường
- 🌙 **Dark theme** - Giao diện tối hiện đại
- 💬 **Quản lý cuộc trò chuyện** - Tạo, chuyển đổi, xoá chat
- 📝 **Markdown rendering** - Hiển thị code, danh sách, in đậm...
- ✨ **Animation mượt** - Message bubbles, typing indicator
- 📲 **Mobile-first** - Responsive hoàn hảo

## 🛠️ Tech Stack

| Công nghệ | Mô tả |
|-----------|--------|
| Next.js 16 | Framework React |
| TypeScript | Ngôn ngữ chính |
| Tailwind CSS 4 | Styling |
| shadcn/ui | UI Components |
| Capacitor 7 | Android native wrapper |
| z-ai-web-dev-sdk | AI Chat API |
| Prisma + SQLite | Database |
| Zustand | State management |
| Framer Motion | Animations |

## 📱 Thông tin APK

| | |
|---|---|
| Package ID | `com.zchat.ai` |
| Min Android | API 24 (Android 7.0) |
| Target Android | API 36 |
| Version | 1.0 |

## 🚀 Chạy locally

```bash
# Cài dependencies
npm install

# Khởi tạo database
npx prisma db push

# Chạy dev server
npm run dev
```

## 📦 Build APK

```bash
# Build web assets
npm run build

# Sync web assets vào Android
npx cap sync android

# Build APK
cd android && ./gradlew assembleRelease
```

## 📄 License

MIT
