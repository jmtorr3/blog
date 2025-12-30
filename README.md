# sys32blog

A modern, full-stack blogging platform built with React and Django, featuring a rich block-based content editor similar to Medium and Notion.

## Features

### Content Editor
- **Block-based editing system** with multiple content types:
  - Text blocks with rich formatting (bold, italic, text color, alignment)
  - Heading blocks (H1-H4) with full text formatting
  - Image blocks with captions and size options
  - Image rows for side-by-side images
  - Code display blocks with syntax highlighting (JavaScript, Python, Java, CSS, HTML, C, C++)
  - Executable code blocks (CSS, HTML, JavaScript) that apply to the published post
- **Rich text formatting**:
  - Bold and italic text
  - Bullet and numbered lists
  - Text alignment (left, center, right)
  - Custom text colors
- **Asset management** system for uploading and managing images used in HTML/CSS code blocks

### User Features
- **Authentication system** with JWT tokens and automatic refresh
- **User blogs** - Each user has their own blog at `/username`
- **Draft management** - Save posts as drafts before publishing
- **Post editing** - Edit published posts with live preview
- **Theme support** - Light and dark mode toggle

### Technical Features
- **RESTful API** built with Django REST Framework
- **Token-based authentication** with automatic token refresh
- **File upload handling** with automatic cleanup when assets are deleted
- **Docker containerization** for easy deployment
- **Automatic database migrations** on container startup
- **Responsive design** with mobile-friendly navigation

## Tech Stack

### Frontend
- **React 19.2.0** - UI framework
- **React Router** - Client-side routing
- **TipTap 3.14.0** - Rich text editor
- **Axios** - HTTP client
- **Prism React Renderer** - Syntax highlighting for code blocks
- **Vite** - Build tool and dev server

### Backend
- **Django 6.0** - Web framework
- **Django REST Framework** - API framework
- **PostgreSQL** - Database
- **Pillow** - Image processing
- **djangorestframework-simplejwt** - JWT authentication

### Infrastructure
- **Docker & Docker Compose** - Containerization
- **Nginx** - Web server (production)

## Project Structure

```
blog/
├── frontend/                 # React application
│   ├── src/
│   │   ├── api/             # API client and auth functions
│   │   ├── components/      # React components
│   │   │   ├── Editor/      # Block editor components
│   │   │   │   ├── blocks/  # Individual block types
│   │   │   │   ├── BlockEditor.jsx
│   │   │   │   ├── BlockRenderer.jsx
│   │   │   │   └── AssetManager.jsx
│   │   │   └── Layout/      # Layout components
│   │   ├── hooks/           # Custom React hooks
│   │   ├── pages/           # Page components
│   │   └── index.css        # Global styles
│   └── package.json
├── backend/                 # Django application
│   ├── posts/              # Posts app
│   │   ├── models.py       # Post and Asset models
│   │   ├── serializers.py  # DRF serializers
│   │   └── views.py        # API endpoints
│   ├── users/              # Users app
│   └── blog_backend/       # Django settings
├── docker-compose.yml
└── README.md
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.11+ (for local development)

### Installation with Docker

1. Clone the repository:
```bash
git clone <repository-url>
cd blog
```

2. Create environment variables:

Create a `.env` file in the `backend/` directory:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DB_NAME=blog_db
DB_USER=blog_user
DB_PASSWORD=your-password-here
DB_HOST=db
DB_PORT=5432
```

3. Build and start the containers:
```bash
docker-compose up --build
```

4. The application will be available at:
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

5. Create a superuser (optional):
```bash
docker-compose exec backend python manage.py createsuperuser
```

### Local Development (Without Docker)

#### Backend Setup

1. Create a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up PostgreSQL and update settings with your database credentials

4. Run migrations:
```bash
python manage.py migrate
```

5. Start the development server:
```bash
python manage.py runserver
```

#### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create a `.env` file:
```env
VITE_API_URL=http://localhost:8000/api
```

3. Start the development server:
```bash
npm run dev
```

## Usage

### Creating a Post

1. Register an account or log in
2. Click "New Post" in the navigation
3. Add content blocks using the toolbar buttons:
   - `+ Text` - Rich text with formatting
   - `+ Heading` - Section headings
   - `+ Image` - Single images
   - `+ Image Row` - Multiple images side-by-side
   - `+ Code` - Executable CSS/HTML/JavaScript
   - `+ Code Display` - Syntax-highlighted code examples
4. Use the Assets manager to upload images for use in HTML/CSS code blocks
5. Click "Save" to save as draft or "Publish" to publish

### Text Formatting

- **Bold** - Click the B button
- *Italic* - Click the I button
- Bullet lists - Click the • button
- Numbered lists - Click the 1. button
- Alignment - Click ⬅, ⬌, or ➡ buttons
- Text color - Click the A button to open color picker

### Custom Styling

Use Code blocks (not Code Display) to add custom CSS, HTML, or JavaScript that will execute on the published post:

1. Add a Code block
2. Select CSS, HTML, or JavaScript as the language
3. Write your code
4. The code will be hidden but executed when the post is published

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/refresh/` - Refresh access token
- `GET /api/auth/me/` - Get current user

### Posts
- `GET /api/posts/` - List all published posts
- `GET /api/posts/:slug/` - Get post by slug
- `POST /api/posts/` - Create new post (authenticated)
- `PUT /api/posts/:slug/` - Update post (authenticated, owner only)
- `DELETE /api/posts/:slug/` - Delete post (authenticated, owner only)

### Users
- `GET /api/users/:username/posts/` - Get user's published posts
- `GET /api/users/:username/drafts/` - Get user's drafts (authenticated, owner only)

### Assets
- `POST /api/assets/upload/` - Upload asset (authenticated)
- `DELETE /api/assets/:id/` - Delete asset (authenticated, owner only)
- `GET /api/assets/` - List user's assets (authenticated)

## Deployment

### Production Considerations

1. **Environment Variables**:
   - Set `DEBUG=False` in production
   - Use a strong `SECRET_KEY`
   - Configure `ALLOWED_HOSTS` in Django settings

2. **Static Files**:
   - Frontend: Build with `npm run build` and serve with Nginx
   - Backend: Collect static files with `python manage.py collectstatic`

3. **Database**:
   - Use a managed PostgreSQL instance for production
   - Set up regular backups

4. **Media Files**:
   - Consider using object storage (S3, Cloudflare R2) for uploaded images
   - Configure `MEDIA_ROOT` and `MEDIA_URL` appropriately

5. **Security**:
   - Enable HTTPS
   - Configure CORS settings
   - Set up rate limiting
   - Use secure cookie settings

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Author

**slumpy**
- GitHub: [@slumpy666](https://github.com/slumpy666)
- Website: [sys32ent.com](https://sys32ent.com)

## Acknowledgments

- Built with [TipTap](https://tiptap.dev/) for the rich text editor
- Syntax highlighting by [Prism](https://prismjs.com/)
- Icons and design inspired by modern blogging platforms
