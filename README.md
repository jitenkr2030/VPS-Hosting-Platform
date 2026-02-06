# VPS Hosting Platform

A modern, full-stack VPS hosting platform built with Next.js 16, TypeScript, and Prisma. This platform provides a complete solution for managing virtual private servers with user authentication, billing integration, and a beautiful UI.

## 🚀 Features

### Core Features
- **User Authentication**: Secure sign up/sign in with NextAuth.js
- **VPS Management**: Create, monitor, and manage VPS instances
- **Dashboard**: Comprehensive dashboard with statistics and resource monitoring
- **Responsive Design**: Mobile-first design with Tailwind CSS and shadcn/ui
- **Database**: SQLite with Prisma ORM for data management

### VPS Features
- **Multiple Plans**: Starter, Professional, and Business tiers
- **Instant Provisioning**: Automated VPS creation and deployment
- **Resource Monitoring**: Real-time CPU, RAM, storage, and bandwidth tracking
- **Status Management**: Active, Pending, Suspended, and Terminated states
- **IP Management**: Automatic IP address assignment
- **OS Templates**: Multiple operating system options

### UI/UX Features
- **Modern Landing Page**: Professional marketing page with pricing
- **Authentication Pages**: Beautiful sign in/sign up forms
- **Interactive Dashboard**: Rich, data-driven user interface
- **Loading States**: Smooth loading and error handling
- **Responsive Design**: Works perfectly on all devices

## 🛠️ Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **TypeScript 5**: Type-safe development
- **Tailwind CSS 4**: Utility-first CSS framework
- **shadcn/ui**: Modern component library
- **Lucide React**: Beautiful icons
- **Framer Motion**: Smooth animations

### Backend
- **NextAuth.js**: Authentication and session management
- **Prisma**: Database ORM and migrations
- **SQLite**: Lightweight database
- **bcryptjs**: Password hashing
- **Zod**: Schema validation

### Development
- **ESLint**: Code quality and consistency
- **TypeScript**: Static type checking
- **Bun**: Fast package manager and runtime

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd vps-hosting-platform
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**
   ```bash
   bun run db:push
   bun run db:seed
   ```

5. **Start the development server**
   ```bash
   bun run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## 🗄️ Database Schema

### Users
- Authentication and user management
- Role-based access (USER/ADMIN)
- Session management with NextAuth.js

### VPS Instances
- Instance configuration and status
- Resource allocation (CPU, RAM, Storage)
- Billing and subscription management
- IP address management

### VPS Templates
- Operating system templates
- Version management
- Template metadata

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   └── vps/           # VPS management endpoints
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Protected dashboard area
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── providers.tsx     # Session provider
├── lib/                  # Utility libraries
│   ├── auth.ts          # NextAuth configuration
│   ├── db.ts            # Prisma client
│   └── utils.ts         # Helper functions
└── prisma/               # Database schema and seeds
    ├── schema.prisma    # Database definition
    └── seed.ts          # Seed data
```

## 🔐 Authentication

The platform uses NextAuth.js for secure authentication:

- **Credentials Provider**: Email/password authentication
- **Session Management**: JWT-based sessions
- **Protected Routes**: Middleware for route protection
- **Role-based Access**: User and admin roles

## 💰 Pricing Plans

### Starter Plan - ₹499/month
- 1 vCPU Core
- 2 GB RAM
- 40 GB NVMe SSD
- 2 TB Bandwidth
- 1 IPv4 Address

### Professional Plan - ₹999/month (Most Popular)
- 2 vCPU Cores
- 4 GB RAM
- 80 GB NVMe SSD
- 4 TB Bandwidth
- 1 IPv4 Address

### Business Plan - ₹1,999/month
- 4 vCPU Cores
- 8 GB RAM
- 160 GB NVMe SSD
- 8 TB Bandwidth
- 2 IPv4 Addresses

## 🚀 Deployment

### Development
```bash
bun run dev
```

### Production Build
```bash
bun run build
bun run start
```

### Database Operations
```bash
bun run db:push      # Push schema changes
bun run db:generate  # Generate Prisma client
bun run db:seed      # Seed database
```

## 🔧 Configuration

### Environment Variables
```env
# Database
DATABASE_URL="file:./db/custom.db"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

## 🎨 UI Components

The platform uses shadcn/ui components for a consistent, modern design:

- **Forms**: Controlled forms with validation
- **Cards**: Clean content containers
- **Buttons**: Interactive button states
- **Navigation**: Responsive navigation components
- **Modals**: Dialog and alert components
- **Loading**: Skeleton and spinner components

## 📱 Responsive Design

- **Mobile-first**: Optimized for mobile devices
- **Breakpoints**: sm, md, lg, xl screen sizes
- **Touch-friendly**: 44px minimum touch targets
- **Adaptive Layout**: Flexible grid systems

## 🛡️ Security Features

- **Password Hashing**: bcryptjs for secure passwords
- **Session Security**: JWT tokens with expiration
- **CSRF Protection**: Built-in NextAuth.js protection
- **Input Validation**: Zod schema validation
- **SQL Injection Prevention**: Prisma ORM protection

## 🔄 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth.js handlers

### VPS Management
- `GET /api/vps/instances` - List user VPS instances
- `POST /api/vps/instances` - Create new VPS instance

## 📊 Monitoring

The dashboard provides comprehensive monitoring:

- **Instance Status**: Real-time status updates
- **Resource Usage**: CPU, RAM, storage metrics
- **Billing Information**: Monthly costs and usage
- **Activity Logs**: Instance creation and management history

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please open an issue in the repository.

---

**Built with ❤️ using Next.js, TypeScript, and modern web technologies.**