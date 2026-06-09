# 🎨 Portfolio Builder - Interactive & Professional

Interactive portfolio builder dengan live preview dan IT-themed design. User bisa mengisi form dan langsung melihat hasilnya di preview.

## 🚀 Cara Menjalankan

### Prerequisites
- Node.js sudah terinstall di komputer Anda

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Jalankan Server
```bash
npm start
```

### Step 3: Buka di Browser
Buka browser dan akses: **http://localhost:3000**

## 📁 File Structure
```
pesanan-azka/
├── index.html       # Main HTML dengan form + preview
├── styles.css       # Design IT-themed modern
├── script.js        # Functionality & live preview
├── server.js        # Node.js Express server
├── package.json     # Dependencies
└── README.md        # Documentation (file ini)
```

## ✨ Features

### 1. Form Input dengan 6 Section:
- **Personal Info**: Nama, email, phone, lokasi
- **Bio/Summary**: Tentang diri Anda
- **Skills**: Skill dengan level (Beginner-Expert)
- **Experience**: Riwayat pekerjaan
- **Projects**: Portfolio projects dengan tech stack
- **Social Media**: Links ke GitHub, LinkedIn, Twitter, dll

### 2. Live Preview
- Update real-time saat user mengetik
- Layout profesional dengan typography bagus
- Code-like styling untuk section headers
- Responsive design

### 3. Data Persistence
- Auto-save ke browser localStorage
- Data tetap ada saat reload page
- Clear all data button untuk reset

### 4. Design IT-Themed
- Dark mode dengan navy/charcoal background
- Gradient cyan-purple accent colors
- Smooth animations & transitions
- Glassmorphism cards
- Modern typography (Poppins, Inter, JetBrains Mono)

## 🎯 Color Palette
- **Primary Background**: #0F0F1F (Dark Navy)
- **Secondary Background**: #1A1A2E
- **Accent Cyan**: #00D9FF
- **Accent Purple**: #8B5CF6
- **Accent Lime**: #00FF41
- **Text**: #E8E8E8

## 📱 Responsive
- Desktop (1024px+): Split layout (40% form, 60% preview)
- Tablet (768px-1024px): Flexible layout
- Mobile (<768px): Stacked layout

## 🛑 Stop Server
Tekan `Ctrl+C` di terminal untuk stop server

## 💾 Data Storage
Semua data disimpan di **localStorage browser**, bukan di server. Artinya:
- Data hanya tersimpan di browser lokal
- Data akan hilang jika clear browser cache
- Data tidak tersimpan di server

## 🔧 Customization

### Mengubah Port
Edit `server.js`, ganti `const PORT = 3000` dengan port yang diinginkan

### Mengubah Warna
Edit `styles.css`, modifikasi CSS variables di `:root {}`

### Menambah Field
Edit `index.html` untuk tambah input fields, `script.js` untuk handle data

## 📝 Notes
- Website berjalan secara lokal, data tidak disimpan di server
- Bisa diakses dari browser apapun (Chrome, Firefox, Safari, Edge)
- Untuk production, perlu tambahan features seperti database dan authentication
