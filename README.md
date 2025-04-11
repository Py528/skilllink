# SkillLink – SaaS Learning Platform UI (Next.js + Tailwind)

SkillLink is a modern SaaS-style learning platform built with [Next.js 14](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/). It features distinct dashboards for learners and instructors, a polished landing page, and reusable UI components—making it a great starting point for an educational or productivity SaaS product.

---

## ✨ Features

- ✅ **Landing Page** with responsive layout
- 👩‍🏫 **Instructor Dashboard**: Course management & student activity
- 🎓 **Learner Dashboard**: Courses, project progress & credentials
- 🧩 **Reusable UI Components**: Navbar, Footer, Cards, Avatars, Progress Bars
- 🌙 **Dark mode support** (via `ModeToggle`)
- 💨 Built with **Tailwind CSS** for rapid UI development
- 🔐 Auth-ready layout with placeholder buttons for Login/Signup

---

## 🚀 Getting Started

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

---

## 🗂️ Project Structure

```
/app
  /dashboard
    page.tsx        → Learner Dashboard
  /instructor
    page.tsx        → Instructor Dashboard
  /page.tsx         → Landing Page

/components
  /layout
    Navbar.tsx      → Navigation bar
    Footer.tsx      → Footer
  /ui
    button.tsx, card.tsx, progress.tsx, avatar.tsx, etc.
```

---

## 📦 Tech Stack

- [Next.js 14 App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/)
- [ShadCN UI](https://ui.shadcn.com/) components
- [Lucide Icons](https://lucide.dev/) (optional if used)
- Fully typed with **TypeScript**

---

## 🧪 Future Improvements

- 🔐 Authentication & role-based routing (e.g., Clerk/Auth.js)
- 📈 Analytics Dashboard for instructors
- 🧾 Certificate generator & verification
- 🧠 Course authoring flow

---

## 📄 License

MIT – feel free to use, customize, or extend this starter.

---

## 🌍 Deployment

This app is optimized for deployment on [Vercel](https://vercel.com). You can get started by clicking below:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

---

## 👋 Stay in Touch

If you're building something with this or want to collab, feel free to reach out!
