# Polly - A Real-Time Polling Application

Polly is a full-stack web application that allows users to create, manage, and vote on polls in real-time. It is built with modern web technologies to provide a seamless and interactive user experience.

## Project Overview

This application is designed to be a real-time polling system where users can sign up, log in, and participate in polls. The key features include:

- **User Authentication**: Secure sign-up and login functionality.
- **Poll Management**: Create, update, and delete polls.
- **Real-Time Voting**: Vote on polls and see the results update live.
- **User Dashboard**: View and manage your polls.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (v14+)
- **Database**: [Supabase](https://supabase.io/) (PostgreSQL)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Testing**: [Vitest](https://vitest.dev/)

## Setup and Installation

To get the project up and running on your local machine, follow these steps:

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/alx-polly.git
cd alx-polly
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

1.  **Create a Supabase Project**: Go to [Supabase](https://supabase.io/) and create a new project.
2.  **Database Schema**: In the Supabase SQL Editor, run the schema from `supabase/migrations/001_initial_schema.sql` to set up the necessary tables and policies.
3.  **Get API Keys**: In your Supabase project settings, find your **Project URL** and **anon key**.

### 4. Configure Environment Variables

Create a `.env.local` file in the root of the project and add your Supabase credentials:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## How to Run the App

To start the development server, run the following command:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the application.

## Usage Examples

### Creating a Poll

1.  Log in to your account.
2.  Navigate to the **Polls** page from the user menu.
3.  Click the **Create Poll** button.
4.  Fill in the poll question and options, then submit.

### Voting on a Poll

1.  From the main dashboard, click on any poll to view it.
2.  Select an option and click the **Vote** button.
3.  The poll results will update in real-time.

## Running Tests

This project uses Vitest for testing. To run the test suite, use the following command:

```bash
npm test
```

This will run all the tests and provide a summary of the results.