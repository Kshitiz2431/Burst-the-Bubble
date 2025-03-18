# BURST THE BUBBLE

![Landing Page](./public/LandingPage.png)

A web platform designed to connect individuals seeking support and guidance through personalized buddy interactions, helping users "burst their bubble" and expand their perspectives through meaningful conversations.

## 🌟 Features

- **User Authentication**: Secure login and registration system
- **Talk to Buddy**: Schedule conversations with buddy mentors
- **Interactive Admin Portal**: Comprehensive management system for:
  - Buddy management
  - Request tracking
  - Content management (blogs, library resources, templates)
  - Newsletter management
  - Analytics and reporting
- **Calendly Integration**: Seamless scheduling with buddy mentors
- **Responsive Design**: Fully responsive UI for all device sizes

## 🚀 Tech Stack

- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui
- **Backend**: Next.js API routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS with custom theming

## 📋 Prerequisites

Before running this project, make sure you have the following installed:

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database
- Git

## 🔧 Installation & Setup

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/BURST_THE_BUBBLE.git
cd BURST_THE_BUBBLE/frontend
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
```

### 3. Set up environment variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/burstthebubble"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Auth providers (if applicable)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Other services
CALENDLY_API_KEY="your-calendly-api-key"
```

### 4. Set up the database

```bash
# Run database migrations
npx prisma migrate dev

# Generate Prisma client
npx prisma generate
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).


## 📝 Admin Portal Access

To access the admin portal:

 Navigate to `/admin/login`

## 🔄 Calendly Integration

To configure Calendly integration:

1. Create a Calendly account if you don't have one
2. Update the Calendly URL in `app/talk-to-buddy/FriendlyForm.tsx` with your Calendly URL
3. Set up the Calendly API key in your `.env` file
```

## 🛠️ Building for Production

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm run start
# or
yarn start
```

## 📁 Project Structure

```
/
├── app/                # Next.js app directory
│   ├── admin/          # Admin portal routes
│   ├── api/            # API routes
│   ├── talk-to-buddy/  # Talk to Buddy feature
│   └── ...
├── components/         # Reusable components
│   ├── admin/          # Admin components
│   ├── ui/             # UI components (shadcn)
│   └── ...
├── lib/                # Utility functions and services
├── prisma/             # Prisma schema and migrations
├── public/             # Static assets
└── ...
```


## 🙏 Acknowledgements

- [Next.js](https://nextjs.org/)
- [Prisma](https://www.prisma.io/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [NextAuth.js](https://next-auth.js.org/)
- [Calendly](https://calendly.com/)

---

Made with ❤️ by Kshitiz Agarwal


