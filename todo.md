# Bysis - E-Commerce Intermediary Platform TODO

## Phase 1: Database & Backend Infrastructure
- [x] Configure Drizzle schema with all tables (users, orders, chat, arrivage, calculations, settings)
- [x] Create database migrations and apply via webdev_execute_sql
- [x] Implement all database helper functions in server/db.ts

## Phase 2: Backend API (tRPC Procedures)
- [x] Create orders router (create, list, update status, search)
- [x] Create price calculator router with LLM multimodal analysis
- [x] Create arrivage items router (list, manage availability)
- [x] Create calculation history router (save, retrieve by session/user)
- [x] Create chat conversation router (create, add messages, get history)
- [x] Create admin settings router (manage app parameters)
- [x] Create notifications router (notify owner on new orders)
- [x] Implement protected procedures for admin-only operations

## Phase 3: Frontend - Public Interface
- [x] Design landing page with company info and CTA
- [x] Create order form with image upload component
- [x] Implement image upload to S3 with progress tracking
- [x] Create order tracking page (search by tracking code)
- [x] Build order status display component
- [x] Implement calculation history view for customers (History.tsx)
- [x] Add responsive design for mobile/tablet

## Phase 4: Frontend - Admin Dashboard
- [x] Create dashboard layout with sidebar navigation
- [x] Build orders management page (list, filter, update status)
- [x] Create order detail view with full information
- [x] Build arrivage management page (add/edit/delete items)
- [x] Create settings page (app parameters configuration)
- [x] Build customer requests/inquiries management (ShipMaster CRM)
- [x] Add admin statistics and metrics display (ShipMaster Analytics)
- [ ] Implement search and filtering across all admin pages

## Phase 5: Image Processing & Price Calculator
- [x] Implement LLM multimodal image analysis for product type/category detection
- [x] Create price calculation logic based on product category
- [x] Build image storage integration with S3 (upload, retrieve, delete)
- [x] Implement image preview in orders and history
- [x] Create calculation history tracking (session-based and user-based)
- [ ] Add calculation result caching

## Phase 6: AI Chat Integration
- [x] Create AI chatbot component for customer support
- [x] Implement chat message storage and retrieval (backend ready)
- [x] Build chat UI with message history
- [x] Integrate LLM for intelligent responses (Anthropic Claude Sonnet)
- [ ] Add context awareness (order info in chat)
- [ ] Implement streaming responses for better UX

## Phase 7: Notifications & Email
- [x] Implement owner notification system for new orders
- [x] Create notification service integration (push notifications)
- [ ] Build notification preferences management
- [ ] Add email notifications (optional enhancement)

## Phase 8: Authentication & Authorization
- [x] Verify Manus OAuth integration
- [x] Implement role-based access control (admin/user)
- [x] Create protected routes for admin dashboard
- [x] Add login/logout functionality
- [x] Implement session management
- [x] Google OAuth integration for customer login

## Phase 9: Testing & Optimization
- [x] Write vitest tests for critical backend procedures (22 tests passing)
- [ ] Test image upload and S3 integration
- [ ] Test LLM integration and price calculations
- [x] Test order creation and status updates (tests created)
- [ ] Performance optimization for large datasets
- [x] Mobile responsiveness testing (responsive design implemented)

## Phase 10: Deployment & Finalization
- [x] Create production checkpoint (manus-webdev://2f83280a)
- [ ] Deploy to Manus WebDev (click Publish button)
- [ ] Verify all features in production
- [ ] Setup custom domain (if needed)
- [ ] Monitor and fix any production issues

## Admin Dashboard ShipMaster (CRM + Analytics + Audit Log)

### Database Schema
- [x] Add `clients` table with full CRM fields
- [x] Add `audit_logs` table
- [x] Add `clientId` FK column to `orders` table
- [x] Add `requiresVerification` boolean column to `orders` table
- [x] Add `profitTnd` and `costTnd` columns to `orders` for revenue tracking

### Backend API
- [x] CRM Router: listClients, getClientById (with full order history), updateClientStatus
- [x] Analytics Router: getDailyStats, getRevenueSummary, getActiveShipments, getTopClients
- [x] Audit Log Router: auto-log every status change, listLogs (admin only)
- [x] Orders Router: updateStatus with audit trail, setRequiresVerification flag

### Frontend Admin UI
- [x] Analytics Dashboard: revenue cards, daily orders chart (recharts), active shipments counter
- [x] CRM page: searchable/filterable client data table + side panel for client detail
- [x] Client detail panel: profile info, order history timeline, ban/suspend/activate buttons
- [x] Orders Management: advanced table with inline status dropdown + verification request button
- [x] Audit Log page: timeline view of all admin actions with filters
- [x] Real-time polling for new orders notification in admin (15s interval)

## 🚀 MASTER PLAN: Bysis Full System (Auth Gate + ShipMaster CRM + Client View)

### DB: Schema Updates
- [x] Add avatarUrl, phone, address, gouvernorat, accountStatus to users table
- [x] Ensure clients table exists with full CRM fields (phone unique, accountStatus, totalOrders, totalSpent)
- [x] Ensure audit_logs table exists (adminId, action, entityType, entityId, oldValue, newValue)
- [x] Ensure orders has clientId FK, requiresVerification, costTnd, profitTnd, platform columns

### Backend: API Routes
- [x] CRM Router: listClients, getClientById+orders, updateClientStatus, updateClientNotes, searchClients
- [x] Analytics Router: getStats (today/week/month orders, revenue, active shipments, daily chart, status breakdown)
- [x] Audit Log Router: listLogs, getLogsByEntity — auto-log every admin action
- [x] Orders Router: updateOrderFull (status + notes + verification flag + profit), auto-upsert client on order create
- [x] User Router: getProfile, updateProfile (phone, address, gouvernorat, avatarUrl)

### Frontend: Auth Gate (Lazy Registration)
- [x] AuthGateModal component: modal — triggers on order/track/chat actions
- [x] Show "Connexion requise" when user tries to confirm order (OrderForm gate)
- [x] Wire AuthGateModal into OrderForm.tsx (submit gate when not authenticated)
- [x] Wire AuthGateModal into FloatingChat.tsx (order-intent gate)
- [x] Persist session with HTTP-only cookie (handled by Manus OAuth + Google OAuth)

### Frontend: Client Profile & Paramètres
- [x] Show user avatar + name in Navbar/AppLayout header after login
- [x] Paramètres page: update phone, address, gouvernorat, display name
- [x] My Orders page: list all orders linked to user account with live status
- [x] Live tracking: order status updates via polling (every 30s) — visual timeline

### Frontend: Admin Dashboard ShipMaster
- [x] Analytics page: revenue cards (today/week/month), daily orders chart (recharts BarChart), active shipments, status pie chart
- [x] CRM page: searchable client table (name, phone, status badge, totalOrders, totalSpent) + side panel
- [x] Client detail panel: profile info, order history timeline, ban/suspend/activate buttons with confirmation dialog
- [x] Orders Management: table with inline status dropdown, requiresVerification toggle, profit/cost fields, admin notes
- [x] Audit Log page: timeline of all admin actions with entity links and filters
- [x] Real-time polling in admin (every 15s) for new orders badge in sidebar

## Google OAuth Integration
- [x] Create server/googleAuth.ts with /api/auth/google and /api/auth/google/callback routes
- [x] Add googleClientId and googleClientSecret to server/_core/env.ts
- [x] Register Google auth routes in server/_core/index.ts
- [x] Fix sdk.ts authenticateRequest to handle google_ prefix users (skip Manus OAuth sync)
- [x] Update AuthGateModal.tsx to show Google Login button
- [x] Add Google Login button to mobile menu in Navbar.tsx
- [x] Write Vitest tests for Google OAuth routes (4 tests passing)
- [x] All 22 tests passing (18 existing + 4 new Google OAuth tests)

## Remaining Tasks
- [x] Wire AuthGateModal into OrderForm.tsx and FloatingChat.tsx
- [ ] Add email notifications (optional enhancement)
- [ ] Implement streaming responses for better UX in chatbot
- [ ] Add context awareness (order info in chat)
- [ ] Performance optimization for large datasets
- [ ] Add calculation result caching
- [ ] Build notification preferences management
- [ ] Deploy to production (click Publish button in UI)

## Admin Dashboard Redesign (ShipMaster)
- [x] Build AdminLayout with professional sidebar (logo, nav items, user info, logout)
- [x] Rebuild CRM/Clients page: searchable table + side panel with client profile, order history, ban/suspend buttons
- [x] Rebuild Tableau de Bord: stats cards (revenue, orders, shipments, pending payment) + charts
- [x] Rebuild Orders Management: advanced table with inline status update, verification flag, profit fields
- [x] Add top header bar: search, notifications bell, admin user avatar
- [x] Light theme matching reference mockup (white/blue/gray palette)
- [x] Mobile hamburger menu support
