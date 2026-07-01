import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/index.tsx"),
    route("services", "routes/services.tsx"),
    route("work", "routes/portfolio.tsx"),
    route("process", "routes/process.tsx"),
    route("contact", "routes/contact.tsx"),
    route("start-a-project", "routes/start-a-project.tsx"),
<<<<<<< HEAD
=======
    route("login", "routes/auth/login.tsx"),
>>>>>>> 437883a (SCB API update)
    route("admin", "routes/admin/index.tsx"),
    route("admin/leads", "routes/admin/leads.tsx"),
    route("admin/pipeline", "routes/admin/pipeline.tsx"),
    route("admin/proposals", "routes/admin/proposals.tsx"),
    route("admin/follow-ups", "routes/admin/follow-ups.tsx"),
    route("admin/projects", "routes/admin/projects.tsx"),
    route("admin/tasks", "routes/admin/tasks.tsx"),
    route("admin/clients", "routes/admin/clients.tsx"),
    route("admin/files", "routes/admin/files.tsx"),
    route("admin/websites", "routes/admin/websites.tsx"),
    route("admin/reports", "routes/admin/reports.tsx"),
    route("admin/analyzer", "routes/admin/analyzer.tsx"),
    route("admin/seo", "routes/admin/seo.tsx"),
    route("admin/uptime", "routes/admin/uptime.tsx"),
    route("admin/finance", "routes/admin/finance.tsx"),
    route("admin/invoices", "routes/admin/invoices.tsx"),
    route("admin/payments", "routes/admin/payments.tsx"),
    route("admin/expenses", "routes/admin/expenses.tsx"),
    route("admin/bookkeeping", "routes/admin/bookkeeping.tsx"),
    route("admin/ai-tools", "routes/admin/ai-tools.tsx"),
    route("admin/proposal-generator", "routes/admin/proposal-generator.tsx"),
    route("admin/copywriter", "routes/admin/copywriter.tsx"),
    route("admin/lead-finder", "routes/admin/lead-finder.tsx"),
    route("admin/calendar", "routes/admin/calendar.tsx"),
    route("admin/email", "routes/admin/email.tsx"),
    route("admin/settings", "routes/admin/settings.tsx"),
<<<<<<< HEAD
=======
    route("admin/login", "routes/auth/admin-login.tsx"),
>>>>>>> 437883a (SCB API update)
] satisfies RouteConfig;
