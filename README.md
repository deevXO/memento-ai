# 🎨 Memento AI - Professional Photo Editor

[![Next.js](https://img.shields.io/badge/Next.js-15.5.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

> Transform your photos with AI-powered editing tools. Remove backgrounds, enhance quality, and create stunning visuals in seconds.

## ✨ Features

- 🎯 **AI Background Removal** - 1-click clean photos with precision AI
- 🖼️ **AI Generative Fill** - Expand your canvas and auto-fill edges seamlessly
- ⚡ **AI Upscale & Enhance** - Boost resolution up to 4x while fixing details
- ✂️ **Smart Crop & Face Focus** - Perfect thumbnails automatically
- 📝 **Watermark & Text Overlay** - Brand your content professionally
- 🌙 **Dark/Light Theme** - Beautiful responsive design
- 🔐 **Google Authentication** - Secure login with NextAuth
- 💳 **Stripe Integration** - Pro subscription management
- 📱 **Mobile Responsive** - Works perfectly on all devices

## 🚀 Tech Stack

- **Framework**: Next.js 15.5.2 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4 with custom theme
- **Database**: PostgreSQL (Neon)
- **ORM**: Prisma
- **Authentication**: NextAuth.js with Google OAuth
- **File Storage**: ImageKit
- **Payments**: Stripe
- **Animations**: Framer Motion
- **UI Components**: Radix UI with shadcn/ui
- **Deployment**: Ready for Vercel/Netlify

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/deevXO/photo-editor.git
   cd photo-editor
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   # Database
   DATABASE_URL="your-postgresql-connection-string"
   
   # NextAuth
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-nextauth-secret"
   
   # Google OAuth
   GOOGLE_CLIENT_ID="your-google-client-id"
   GOOGLE_CLIENT_SECRET="your-google-client-secret"
   
   # ImageKit
   IMAGEKIT_PUBLIC_KEY="your-imagekit-public-key"
   IMAGEKIT_PRIVATE_KEY="your-imagekit-private-key"
   IMAGEKIT_URL_ENDPOINT="your-imagekit-endpoint"
   
   # Stripe (Optional)
   STRIPE_SECRET_KEY="your-stripe-secret-key"
   STRIPE_PUBLISHABLE_KEY="your-stripe-publishable-key"
   STRIPE_PRICE_ID="your-stripe-price-id"
   STRIPE_WEBHOOK_SECRET="your-stripe-webhook-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Database Setup (Neon PostgreSQL)

1. Create a [Neon](https://neon.tech) account
2. Create a new project and database
3. Copy the connection string to `DATABASE_URL`

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (development)
   - `https://yourdomain.com/api/auth/callback/google` (production)

### ImageKit Setup

1. Create an [ImageKit](https://imagekit.io) account
2. Get your public key, private key, and URL endpoint
3. Add to environment variables

### Stripe Setup (Optional)

1. Create a [Stripe](https://stripe.com) account
2. Get your API keys (test/live)
3. Create a product and price
4. Set up webhooks for subscription management

## 🚀 Deployment

### Vercel (Recommended)

1. **Deploy to Vercel**
   ```bash
   npm install -g vercel
   vercel
   ```

2. **Set environment variables** in Vercel dashboard

3. **Update production URLs**:
   - Update `NEXTAUTH_URL` to your production domain
   - Add production redirect URI to Google OAuth

### Other Platforms

- **Netlify**: Use `npm run build` and deploy the `out` folder
- **Railway**: Connect your GitHub repo and set environment variables
- **Docker**: Dockerfile included for containerized deployment

## 📁 Project Structure

```
photo-editor/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # Reusable components
│   ├── ui/               # shadcn/ui components
│   ├── navbar/           # Navigation
│   └── footer/           # Footer
├── modules/              # Feature modules
│   ├── hero/             # Hero section
│   ├── features/         # Features showcase
│   ├── pricing/          # Pricing plans
│   └── editor/           # Photo editor
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── prisma/               # Database schema
└── public/               # Static assets
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `NEXTAUTH_URL` | Application URL | ✅ |
| `NEXTAUTH_SECRET` | NextAuth secret key | ✅ |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | ✅ |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | ✅ |
| `IMAGEKIT_PUBLIC_KEY` | ImageKit public key | ✅ |
| `IMAGEKIT_PRIVATE_KEY` | ImageKit private key | ✅ |
| `IMAGEKIT_URL_ENDPOINT` | ImageKit URL endpoint | ✅ |
| `STRIPE_SECRET_KEY` | Stripe secret key | ❌ |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | ❌ |
| `STRIPE_PRICE_ID` | Stripe price ID | ❌ |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | ❌ |

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Deevanshu Kapoor**

- GitHub: [@deevXO](https://github.com/deevXO)
- X (Twitter): [@deevbuilds](https://x.com/deevbuilds)
- LinkedIn: [Deevanshu Kapoor](https://www.linkedin.com/in/deevanshu-kapoor-a71098289)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org) for the amazing React framework
- [Tailwind CSS](https://tailwindcss.com) for the utility-first CSS framework
- [Prisma](https://prisma.io) for the type-safe database ORM
- [shadcn/ui](https://ui.shadcn.com) for the beautiful UI components
- [Framer Motion](https://framer.com/motion) for smooth animations
- [ImageKit](https://imagekit.io) for image processing and optimization

## 🐛 Issues

If you encounter any issues, please [create an issue](https://github.com/deevXO/photo-editor/issues) on GitHub.

## ⭐ Support

If you found this project helpful, please give it a star on GitHub!

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/deevXO">Deevanshu Kapoor</a> for creators everywhere</p>
  <p>© 2025 Memento AI. All rights reserved.</p>
</div>
