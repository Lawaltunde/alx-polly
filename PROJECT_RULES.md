# Project Rules and Development Patterns

These high-level rules guide all development in this project to ensure quality, security, and maintainability.

## 1. User-Centric & Secure
All settings features must prioritize user experience, accessibility, and data security—especially for authentication, profile, and account management.

## 2. Type-Safe & Validated
All user input will be strictly validated (using Zod or similar) and handled with TypeScript for type safety and reliability.

## 3. Modular & Maintainable
Code will be organized into clear, reusable modules (UI, server actions, Supabase helpers) to support easy scaling and future enhancements.

## 4. Server Actions for Sensitive Ops
All sensitive operations (profile updates, password changes, account deletion) will use server actions to ensure security and proper session handling.

## 5. Feedback & Error Handling
Every user action will provide clear feedback (success, error, loading), and all errors will be handled gracefully both in the UI and backend.

---

These rules must be followed for all new features and refactors. Update this file if project goals or architecture change.
