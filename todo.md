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
- [ ] Implement image upload to S3 with progress tracking
- [x] Create order tracking page (search by tracking code)
- [x] Build order status display component
- [ ] Implement calculation history view for customers
- [x] Add responsive design for mobile/tablet

## Phase 4: Frontend - Admin Dashboard
- [x] Create dashboard layout with sidebar navigation
- [x] Build orders management page (list, filter, update status)
- [x] Create order detail view with full information
- [x] Build arrivage management page (add/edit/delete items)
- [x] Create settings page (app parameters configuration)
- [ ] Build customer requests/inquiries management
- [ ] Add admin statistics and metrics display
- [ ] Implement search and filtering across all admin pages

## Phase 5: Image Processing & Price Calculator
- [x] Implement LLM multimodal image analysis for product type/category detection
- [x] Create price calculation logic based on product category
- [ ] Build image storage integration with S3 (upload, retrieve, delete)
- [ ] Implement image preview in orders and history
- [x] Create calculation history tracking (session-based and user-based)
- [ ] Add calculation result caching

## Phase 6: AI Chat Integration
- [x] Create AI chatbot component for customer support
- [x] Implement chat message storage and retrieval (backend ready)
- [x] Build chat UI with message history
- [x] Integrate LLM for intelligent responses (placeholder)
- [ ] Add context awareness (order info in chat)
- [ ] Implement streaming responses for better UX

## Phase 7: Notifications & Email
- [x] Implement owner notification system for new orders
- [ ] Create notification service integration
- [ ] Build notification preferences management
- [ ] Add email notifications (optional enhancement)

## Phase 8: Authentication & Authorization
- [x] Verify Manus OAuth integration
- [x] Implement role-based access control (admin/user)
- [x] Create protected routes for admin dashboard
- [x] Add login/logout functionality
- [x] Implement session management

## Phase 9: Testing & Optimization
- [x] Write vitest tests for critical backend procedures (basic tests created)
- [ ] Test image upload and S3 integration
- [ ] Test LLM integration and price calculations
- [x] Test order creation and status updates (tests created)
- [ ] Performance optimization for large datasets
- [x] Mobile responsiveness testing (responsive design implemented)

## Phase 10: Deployment & Finalization
- [ ] Create production checkpoint
- [ ] Deploy to Manus WebDev
- [ ] Verify all features in production
- [ ] Setup custom domain (if needed)
- [ ] Monitor and fix any production issues

## Known Issues & TODO
- [ ] Implement true multimodal image upload to S3 (currently using base64)
- [ ] Add dedicated calculation history router with user/session filtering
- [ ] Create chatbot UI component with streaming support
- [ ] Add email notification integration
- [ ] Implement search functionality in orders management
- [ ] Add pagination to large data tables

## Admin Dashboard ShipMaster (CRM + Analytics + Audit Log)

### Database Schema
- [ ] Add `clients` table: id, userId, name, phone, email, address, accountStatus (active/banned/suspended), totalOrders, totalSpent, notes
- [ ] Add `audit_logs` table: id, adminId, action, entityType, entityId, oldValue, newValue, createdAt
- [ ] Add `clientId` FK column to `orders` table linking to `clients`
- [ ] Add `requiresVerification` boolean column to `orders` table
- [ ] Add `profitTnd` and `costTnd` columns to `orders` for revenue tracking

### Backend API
- [ ] CRM Router: listClients, getClientById (with full order history), updateClientStatus (ban/suspend/activate)
- [ ] Analytics Router: getDailyStats, getRevenueSummary, getActiveShipments, getTopClients
- [ ] Audit Log Router: auto-log every status change, listLogs (admin only)
- [ ] Orders Router: updateStatus with audit trail, setRequiresVerification flag

### Frontend Admin UI
- [ ] Analytics Dashboard: revenue cards, daily orders chart (recharts), active shipments counter
- [ ] CRM page: searchable/filterable client data table + side panel for client detail
- [ ] Client detail panel: profile info, order history timeline, ban/suspend/activate buttons
- [ ] Orders Management: advanced table with inline status dropdown + verification request button
- [ ] Audit Log page: timeline view of all admin actions with filters
- [ ] Real-time polling for new orders notification in admin

## 🚀 MASTER PLAN: Bysis Full System (Auth Gate + ShipMaster CRM + Client View)

### DB: Schema Updates
- [ ] Add avatarUrl, phone, address, gouvernorat, accountStatus to users table
- [ ] Ensure clients table exists with full CRM fields (phone unique, accountStatus, totalOrders, totalSpent)
- [ ] Ensure audit_logs table exists (adminId, action, entityType, entityId, oldValue, newValue)
- [ ] Ensure orders has clientId FK, requiresVerification, costTnd, profitTnd, platform columns

### Backend: API Routes
- [ ] CRM Router: listClients, getClientById+orders, updateClientStatus, updateClientNotes, searchClients
- [ ] Analytics Router: getStats (today/week/month orders, revenue, active shipments, daily chart, status breakdown)
- [ ] Audit Log Router: listLogs, getLogsByEntity — auto-log every admin action
- [ ] Orders Router: updateOrderFull (status + notes + verification flag + profit), auto-upsert client on order create
- [ ] User Router: getProfile, updateProfile (phone, address, gouvernorat, avatarUrl)

### Frontend: Auth Gate (Lazy Registration)
- [ ] AuthGateModal component: bottom-sheet on mobile, modal on desktop — triggers on order/track/chat actions
- [ ] Show "Connexion requise" only when user tries to confirm order, track shipment, or account-bound chat action
- [ ] After login: auto-link existing orders by phone number to user account
- [ ] Persist session with HTTP-only cookie (already handled by Manus OAuth)

### Frontend: Client Profile & Paramètres
- [ ] Show user avatar + name in Navbar/AppLayout header after login
- [ ] Paramètres page: update phone, address, gouvernorat, display name
- [ ] My Orders page: list all orders linked to user account with live status
- [ ] Live tracking: order status updates via polling (every 30s) — visual timeline

### Frontend: Admin Dashboard ShipMaster
- [ ] Analytics page: revenue cards (today/week/month), daily orders chart (recharts BarChart), active shipments, status pie chart
- [ ] CRM page: searchable client table (name, phone, status badge, totalOrders, totalSpent) + side panel
- [ ] Client detail panel: profile info, order history timeline, ban/suspend/activate buttons with confirmation dialog
- [ ] Orders Management: table with inline status dropdown, requiresVerification toggle, profit/cost fields, admin notes
- [ ] Audit Log page: timeline of all admin actions with entity links and filters
- [ ] Real-time polling in admin (every 15s) for new orders badge in sidebar

## Google OAuth Integration
- [x] Create server/googleAuth.ts with /api/auth/google and /api/auth/google/callback routes
- [x] Add googleClientId and googleClientSecret to server/_core/env.ts
- [x] Register Google auth routes in server/_core/index.ts
- [x] Fix sdk.ts authenticateRequest to handle google_ prefix users (skip Manus OAuth sync)
- [x] Update AuthGateModal.tsx to show Google Login button
- [x] Add Google Login button to mobile menu in Navbar.tsx
- [x] Write Vitest tests for Google OAuth routes (4 tests passing)
- [x] All 22 tests passing (18 existing + 4 new Google OAuth tests)
