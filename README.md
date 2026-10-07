# StayFinder Hotel CRUD - Corrected Version

## 1. Frontend

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open http://localhost:5173

The frontend intentionally starts with demo hotel data. Therefore the page will NOT be blank if the backend or PostgreSQL is not running.

## 2. PostgreSQL

Create the database in psql:

```sql
CREATE DATABASE hotel_db;
```

Then from the project root:

```powershell
& "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d hotel_db -f backend\schema.sql
```

If your PostgreSQL version is different, change `18` in the path.

## 3. Backend

Copy `backend/.env.example` to `backend/.env`, then set the database connection and unique admin credentials. Use a strong, private password and replace `SESSION_SECRET` with at least 32 random characters. Do not deploy with the example values.

```env
PORT=5000
ADMIN_USERNAME=your-admin-name
ADMIN_PASSWORD=your-unique-long-password
SESSION_SECRET=generate-at-least-32-random-characters
FRONTEND_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/hotel_db
```

`FRONTEND_ORIGINS` is a comma-separated allowlist. Set it to the exact frontend origin(s) used by your deployment.

Then:

```powershell
cd backend
npm.cmd install
npm.cmd run dev
```

Expected:
`API running on http://localhost:5000`

## 4. Use the site

- `/` Hotel list
- `/login` Host sign-in
- `/add` Add hotel (signed-in host)
- `/edit/:id` Edit hotel (signed-in host)
- `/hotels/:id` Hotel details
- `/about` About StayFinder
- Search by title
- Filter by price
- Pagination
- JPG, PNG, or WebP image upload (up to 8 MB) with a live preview
- PostgreSQL CRUD through native SQL

Hotel changes require the configured host account. Sign-in uses an expiring HttpOnly session cookie. Uploaded image bytes are checked by the backend; SVG and other active-content formats are rejected.

## Important

If you see the demo notice, the frontend is working. It means the backend/PostgreSQL connection is not available yet.

## Screenshots

### 1. Home Page & Discover
The main landing page displaying a grid of available hotels. Users can browse through luxury stays and view brief details like title, location, and price.
![Home Page](./screenshots/home-page.png)

### 2. Hotel Pagination View
Users can easily navigate through multiple pages of hotel listings using the pagination controls at the bottom of the discovery page.
![Pagination View](./screenshots/pagination-view.png)

### 3. Add New Hotel - Details Form
A comprehensive form for hosts to add new properties. Features an interactive layout with a real-time preview of the hotel card on the right.
![Add Hotel Form](./screenshots/add-hotel-form.png)

### 4. Add New Hotel - Image Upload
The lower section of the form supports drag-and-drop image uploads for the property's cover photo, with built-in validation for JPG, PNG, and WebP formats.
![Add Hotel Upload](./screenshots/add-hotel-upload.png)

### 5. Manage Hotels
The management dashboard where hosts can view their properties, edit details, or remove listings using the dedicated action buttons.
![Manage Hotels](./screenshots/manage-hotels.png)
