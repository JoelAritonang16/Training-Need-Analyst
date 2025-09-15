# Sistem Login dengan Database

Sistem login yang terhubung dengan database menggunakan Node.js (Express) untuk backend dan React untuk frontend.

## Fitur

- ✅ Form login yang terhubung dengan database
- ✅ Autentikasi menggunakan session dan bcrypt
- ✅ Dashboard setelah login berhasil
- ✅ Logout dengan destroy session
- ✅ Responsive design
- ✅ State management untuk user authentication
- ✅ Loading states dan error handling

## Struktur Proyek

```
pelindo_tna/
├── backend/                 # Backend Node.js + Express
│   ├── config/             # Konfigurasi database
│   ├── controllers/        # Controller untuk auth
│   ├── models/            # Model database (Sequelize)
│   ├── routes/            # API routes
│   ├── middleware/        # Middleware auth
│   └── scripts/           # Script untuk setup database
├── frontend/              # Frontend React
│   ├── src/
│   │   ├── components/    # Komponen React
│   │   │   ├── Login.js   # Form login
│   │   │   └── Dashboard.js # Dashboard setelah login
│   │   └── App.js         # App utama
└── README.md
```

## Cara Menjalankan

### 1. Setup Backend

```bash
cd backend
npm install
```

Pastikan database MySQL sudah berjalan dan update konfigurasi di `config/config.js`

### 2. Setup Database

Jalankan script untuk membuat user test:

```bash
cd backend
node scripts/createTestUser.js
```

### 3. Jalankan Backend

```bash
cd backend
npm start
```

Backend akan berjalan di `http://localhost:5000`

### 4. Setup Frontend

```bash
cd frontend
npm install
```

### 5. Jalankan Frontend

```bash
cd frontend
npm start
```

Frontend akan berjalan di `http://localhost:3000`

## User Test

Setelah menjalankan script `createTestUser.js`, Anda bisa login dengan:

- **Admin**: username=`admin`, password=`admin123`
- **User**: username=`user1`, password=`user123`
- **Manager**: username=`manager`, password=`manager123`

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info
- `GET /api/auth/user/:id` - Get user by ID

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## Fitur Frontend

### Login Component
- Form input username dan password
- Validasi input
- Loading state saat submit
- Error handling
- Success message
- Responsive design

### Dashboard Component
- Navbar dengan user info dan logout button
- Welcome section
- User information card
- Menu utama
- Status sistem
- Real-time clock

## Security Features

- Password hashing menggunakan bcrypt
- Session-based authentication
- Input validation
- SQL injection protection (Sequelize ORM)
- CORS configuration

## Dependencies

### Backend
- Express.js
- Sequelize (ORM)
- MySQL2
- bcrypt (password hashing)
- express-session
- cors

### Frontend
- React
- CSS3 dengan animations
- Fetch API untuk HTTP requests
- LocalStorage untuk state persistence

## Troubleshooting

### Database Connection Error
- Pastikan MySQL server berjalan
- Check konfigurasi database di `config/config.js`
- Pastikan database dan user sudah dibuat

### CORS Error
- Backend sudah dikonfigurasi dengan CORS
- Frontend menggunakan `credentials: 'include'`

### Session Error
- Pastikan express-session sudah dikonfigurasi
- Check secret key di backend

## Development

### Menambah User Baru
1. Update script `createTestUser.js`
2. Jalankan script untuk membuat user baru
3. Atau buat endpoint register di backend

### Customizing UI
- Update CSS files di `frontend/src/components/`
- Modify komponen React sesuai kebutuhan
- Gunakan CSS variables untuk konsistensi warna

### Adding New Features
- Buat komponen baru di `frontend/src/components/`
- Tambah routes baru di backend
- Update middleware auth jika diperlukan

## License

MIT License
