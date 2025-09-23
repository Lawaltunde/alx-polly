# ALX Polly Setup Guide

## 🚀 Quick Start

### 1. Environment Setup
Your `.env.local` file is already configured with Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<YOUR_PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 2. Database Setup

#### Option A: Using Supabase Dashboard (Recommended)
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `<YOUR_PROJECT_REF>`
3. Go to **SQL Editor**
4. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
5. Click **Run** to execute the migration

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref <YOUR_PROJECT_REF>

# Run migration
supabase db push
```

### 3. Authentication Setup
1. In Supabase Dashboard, go to **Authentication > Settings**
2. Configure your site URL: `http://localhost:3000` (development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/auth/login`
   - `http://localhost:3000/auth/signup`

### 4. Run the Application
```bash
npm run dev
```

## 🗄️ Database Schema

The application uses the following tables:

- **profiles**: User profiles (extends Supabase auth)
- **polls**: Poll questions and metadata
- **poll_options**: Individual poll options
- **votes**: User votes with tracking
- **poll_qr_codes**: QR codes for poll sharing

## 🔐 Row Level Security (RLS)

All tables have RLS enabled with policies:
- Users can only view/edit their own polls
- Public polls are viewable by everyone
- Votes are protected from manipulation
- QR codes are publicly accessible

## 🧪 Testing

Run the test suite:
```bash
npm test
npm run test:coverage
```

## 🚀 Deployment

### Vercel Deployment
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy!

### Environment Variables for Production
```env
NEXT_PUBLIC_SUPABASE_URL=your_production_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Verify Supabase credentials in `.env.local`
   - Check if database schema is created

2. **Authentication Not Working**
   - Verify redirect URLs in Supabase Auth settings
   - Check browser console for errors

3. **QR Codes Not Generating**
   - Ensure `qrcode` and `nanoid` packages are installed
   - Check if database tables exist

### Getting Help

- Check the browser console for error messages
- Verify Supabase dashboard for database issues
- Run tests to identify code problems

## 📱 Features

✅ **User Authentication** - Supabase Auth integration  
✅ **Poll Creation** - Create polls with multiple options  
✅ **Voting System** - Secure voting with RLS  
✅ **QR Code Generation** - Share polls via QR codes  
✅ **Real-time Updates** - Live poll results  
✅ **Responsive Design** - Mobile-first UI  
✅ **Type Safety** - Full TypeScript support  
✅ **Testing Suite** - Comprehensive test coverage  

## 🎯 Next Steps

1. **Set up the database** using the migration script
2. **Test authentication** by creating a user account
3. **Create your first poll** and test the voting system
4. **Generate QR codes** for easy poll sharing
5. **Deploy to production** when ready

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Shadcn/ui Components](https://ui.shadcn.com/)
