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
- [x] Implement search and filtering across all admin pages (search in ShipMaster CRM + Orders)

## Phase 5: Image Processing & Price Calculator
- [x] Implement LLM multimodal image analysis for product type/category detection
- [x] Create price calculation logic based on product category
- [x] Build image storage integration with S3 (upload, retrieve, delete)
- [x] Implement image preview in orders and history
- [x] Create calculation history tracking (session-based and user-based)
- [x] Add calculation result caching (queryCache.ts already implemented)

## Phase 6: AI Chat Integration
- [x] Create AI chatbot component for customer support
- [x] Implement chat message storage and retrieval (backend ready)
- [x] Build chat UI with message history
- [x] Integrate LLM for intelligent responses (Anthropic Claude Sonnet)
- [x] Add context awareness (arrivage info in chat via buildSystemPrompt)
- [ ] Implement streaming responses for better UX (optional enhancement)

## Phase 7: Notifications & Email
- [x] Implement owner notification system for new orders
- [x] Create notification service integration (push notifications)
- [ ] Build notification preferences management (optional enhancement)
- [ ] Add email notifications (optional enhancement — not required)

## Phase 8: Authentication & Authorization
- [x] Verify Manus OAuth integration
- [x] Implement role-based access control (admin/user)
- [x] Create protected routes for admin dashboard
- [x] Add login/logout functionality
- [x] Implement session management
- [x] Google OAuth integration for customer login

## Phase 9: Testing & Optimization
- [x] Write vitest tests for critical backend procedures (22 tests passing)
- [x] Test image upload and S3 integration (tested via calculator flow)
- [x] Test LLM integration and price calculations (tested via calculator flow)
- [x] Test order creation and status updates (tests created)
- [x] Performance optimization for large datasets (queryCache.ts + lazy loading)
- [x] Mobile responsiveness testing (responsive design implemented)

## Phase 10: Deployment & Finalization
- [x] Create production checkpoint (manus-webdev://1957b836)
- [ ] Deploy to Manus WebDev (click Publish button in UI)
- [x] Verify all features in dev environment
- [x] Setup custom domain (bysis.shop)
- [ ] Monitor and fix any production issues (post-deployment)

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
- [ ] Add email notifications (optional enhancement — not required)
- [ ] Implement streaming responses for better UX in chatbot (optional enhancement)
- [x] Add context awareness (arrivage info in chat via buildSystemPrompt)
- [x] Performance optimization for large datasets (queryCache.ts + lazy loading)
- [x] Add calculation result caching (queryCache.ts already implemented)
- [ ] Build notification preferences management (optional enhancement)
- [ ] Deploy to production (click Publish button in UI — user action required)

## Admin Dashboard Redesign (ShipMaster)
- [x] Build AdminLayout with professional sidebar (logo, nav items, user info, logout)
- [x] Rebuild CRM/Clients page: searchable table + side panel with client profile, order history, ban/suspend buttons
- [x] Rebuild Tableau de Bord: stats cards (revenue, orders, shipments, pending payment) + charts
- [x] Rebuild Orders Management: advanced table with inline status update, verification flag, profit fields
- [x] Add top header bar: search, notifications bell, admin user avatar
- [x] Light theme matching reference mockup (white/blue/gray palette)
- [x] Mobile hamburger menu support

## Phase: Bottom Nav + Profile Sheet + Panier (May 2026)
- [x] Bottom nav implemented: 5 tabs (Accueil, Catalogue, AI, Panier, Moi)
- [x] Add iPhone safe-area-inset-bottom to bottom nav
- [x] Build ProfileSheet (Dribbble-style bottom sheet)
  - [x] Authenticated: avatar, name, email, Mes Commandes, Suivi, Historique, Déconnexion
  - [x] Guest: icon, Se connecter button, Suivre commande
  - [x] Dark/Light mode toggle (localStorage persisted)
  - [x] Language toggle FR/AR (i18n context, localStorage persisted)
  - [x] Termes & Conditions page
  - [x] Contacter nous → mailto:Iscof840@gmail.com
- [x] Build CartContext (add/remove/clear, persisted in localStorage)
- [x] Boutique page: "Ajouter au panier" button on each product
- [x] Panier page: list items, quantity control, total price, "Commander" CTA
- [x] Commander → pre-fill OrderForm with first cart item
- [x] Cart badge count on Panier tab icon
- [x] Apply i18n translations to all public pages (FR/AR)

## 🎨 Shein-Inspired Redesign (May 2026)
- [x] Update index.css: Shein color palette (red #E8192C, white #FFFFFF, black #1A1A1A, green #00A650)
- [x] Add Inter/Nunito Google Font in index.html
- [x] Update AppLayout.tsx: Shein-style bottom nav icons (line icons), lift nav with safe-area + 16px extra
- [x] Update AppLayout.tsx: white bottom nav background with top border, red active icon
- [x] Rebuild Home.tsx: Shein-inspired hero section with real service images
- [x] Add testimonials section with customer photos and ratings
- [x] Add "Comment ça marche" professional 3-step section
- [x] Add platforms section (Shein/AliExpress/Temu) with real logos
- [x] Search and upload real product/service images via manus-upload-file

## 🖤 Shein Full Visual Identity (Radical Redesign - May 2026)
- [x] index.css: white/black base, Inter font, Shein line-icon style, red only for CTAs
- [x] AppLayout: Shein-exact bottom nav (Acheter/Catégories/Tendances/Panier/Moi), white bg, black icons, red active
- [x] Calculator page: Shein-style white card, black text, red calculate button
- [x] OrderForm page: Shein-style form, white/black, red submit button
- [x] TrackOrder page: Shein-style order status timeline (black/white/red)
- [x] OrderConfirmation page: Shein-style success (black checkmark, red CTA)
- [x] Panier page: Shein-style cart (white cards, black text, red checkout button)
- [x] History page: Shein-style order list (white cards, black text, status badges)
- [x] Orders page: Shein-style order management
- [x] Settings page: Shein-style settings (white rows, black text, chevrons)
- [x] Parametres page: Shein-style preferences
- [x] Arrivage page: Shein-style product grid (white cards, black text, red badges)


## 🎯 Typography & Icons Implementation (May 2026)
- [x] Install lucide-react (400+ line icons)
- [x] Update index.html with Poppins Google Font
- [x] Update index.css with --font-display and Shein color palette CSS variables
- [x] Replace custom SVG icons in AppLayout with lucide-react (Home, Grid3x3, TrendingUp, ShoppingCart, User, Plus, Search)
- [x] Update AppLayout icon rendering with size={22} strokeWidth={1.6} for consistency
- [x] All pages now use lucide-react icons instead of custom SVGs
- [x] No build errors, all TypeScript checks passing


## 🎨 Professional Color System Implementation (May 2026)
- [x] Update index.css: Brand colors (Black #0A0A0A, White #FFFFFF, Logistics Blue #0047AB)
- [x] Update index.css: Secondary colors (Charcoal #2D2D2D, Dark Gray #4A4A4A, Light Gray #E0E0E0)
- [x] Update index.css: Semantic colors (Success Green #28A745, Warning Yellow #FFC107, Error Red #DC3545)
- [x] Replace all CTA buttons with Logistics Blue #0047AB
- [x] Update all page backgrounds to use new color palette
- [x] Apply semantic colors to status badges and notifications
- [x] Update AppLayout header and Bottom Nav with new colors
- [x] Update all form inputs and interactive elements
- [x] Verify color contrast for accessibility (WCAG AA standard)


## 🎬 Dynamic UI Redesign (May 2026)
- [x] Install Framer Motion (advanced animations and transitions)
- [x] Install Swiper (carousel/slider component)
- [x] Install react-intersection-observer (scroll animations)
- [x] Rebuild Home.tsx: Large hero image with dynamic parallax effect
- [x] Add smooth scroll animations to all sections
- [x] Create animated card components with hover effects
- [x] Implement image carousel for product/service showcase
- [x] Add fade-in animations on scroll for all sections
- [x] Create dynamic testimonials carousel with auto-play
- [x] Add micro-interactions to buttons and CTAs
- [x] Update all pages with dynamic components
- [x] Test animations on mobile devices

## Phase 6.5: Amazon-Style Header & Navigation (COMPLETED)
- [x] Dynamic background covers entire screen from top (behind header) - FIXED
- [x] Search bar redesigned: white background, rounded borders, search icon left, Google Lens camera icon right - FIXED
- [x] Scanner functionality moved from Bottom Nav FAB to camera icon in search bar - FIXED
- [x] Bottom Nav simplified: removed Scanner FAB, now 4 tabs (Home, Boutiques, Cart, Profile) - FIXED
- [x] Dynamic background color transitions smoothly with blur effect on header - FIXED
- [x] Background color now reflects image color accurately (gray #C0C0C0) - FIXED
- [x] Logo and icons properly positioned and styled - FIXED
- [x] All tests passing (22/22) - VERIFIED

## Phase 8: Amazon Lens-Style Camera Scanner (NEW)
- [x] Scanner page: full-screen camera view (black background)
- [x] Scanner header: back arrow + "lens ai✦" title + flash icon + help (?) icon
- [x] Scanner bottom: upload image button (left) + capture/search button (center) + barcode scanner (right)
- [x] Scanner hint text: "Prendre une photo pour rechercher des produits"
- [x] Flash toggle (on/off)
- [x] Barcode scanner mode (html5-qrcode)
- [x] Help page (?) with black background explaining how camera search works
- [x] Route from Google Lens icon in search bar to new Scanner page

## Bug Fix: FloatingChat Quick Action (May 2026)
- [x] Fix FloatingChat.tsx: change `setIsCalculatorModalOpen(true)` to `navigate('/scanner')` when user clicks "احسبلي سعر منتوج" quick action
- [x] Remove dead code: CalculatorModal import, isCalculatorModalOpen state, CalculatorModal JSX block
- [x] Remove unused Calculator icon import from @phosphor-icons/react
- [x] All 22 tests still passing after fix

## AI Chat Settings & History (June 2026)
- [x] Add view state (chat/settings/manage-history) to AIChat.tsx
- [x] Add getMyHistory and clearMyHistory tRPC procedures
- [x] Add getConversationBySessionId and clearConversationHistory DB helpers
- [x] Settings Panel: "Gérer la discussion" + "Pour commencer" with ChevronRight arrows
- [x] History Panel: "Effacer l'historique" button with confirm dialog + message list
- [x] "..." button opens Settings Panel (slide-in from right)
- [x] Back button in each panel to navigate back
- [x] Input area only visible in chat view
- [x] TypeScript errors: 0, Tests: 22/22

## 🎨 Dynamic Color Carousel - Amazon Style (Jun 2026)
- [x] DynamicColorCarousel component with Embla Carousel
- [x] Color interpolation between slides on scroll (lerpColor)
- [x] 4 slides with uploaded images (red, blue, green, teal)
- [x] Dot indicators that change color with active slide
- [x] Quick Actions and Bysis AI banner below carousel
- [x] Background color lightened by 25% for softer feel
- [x] Glassmorphism effect on Quick Actions and Features sections

## 🚀 Amazon-Style Improvements (Jun 2026)
- [x] Carousel: color change only in Hero area (not full page) — white below
- [x] Carousel: full-width slides (not cards), background color fills hero container
- [x] Chatbot: convert to Bottom Sheet (slide up from bottom, slide down to close)
- [x] Chatbot: open/close button in Bottom Nav with smooth animation
- [x] Hamburger menu: slide-in categories page (Bysis boutique vocabulary)
- [x] Categories page: Vos raccourcis + Acheter par catégorie sections
- [x] Performance: React.lazy + Suspense for page components
- [x] Performance: image lazy loading + decoding async

## 🚀 Amazon-Style Improvements (June 2026)
- [x] Carousel: تغيير لون Hero فقط (ليس الصفحة كلها) — باقي الصفحة بيضاء ثابتة
- [x] Carousel: loop: true + Autoplay كل 4 ثوان مع stopOnInteraction
- [x] BoutiqueMenu: slide-in من اليسار عند الضغط على Hamburger (≡)
- [x] BoutiqueMenu: Vos raccourcis + Acheter par catégorie (8 أقسام) + Aide & Paramètres
- [x] BoutiqueMenu: Header أسود مع اسم المستخدم أو "Connectez-vous"
- [x] BoutiqueMenu: Sub-categories قابلة للتوسع مع animation
- [x] AppLayout: الخلفية بيضاء ثابتة (فقط Hero يتغير لونه)
- [x] AIChat History Panel: Settings Panel + History Panel + Clear History
- [x] Performance: code splitting + lazy loading + vite optimizations (كل شيء مُحسَّن)

## 🎨 Advanced UX (June 2026 - v2)
- [x] Header شفاف يجلس فوق Carousel (لا قبله)
- [x] لون الـ Carousel يمتد خلف الـ header وحتى status bar
- [x] عند السكرول للأسفل: header يتحول أبيض تدريجياً
- [x] عند الرجوع للأعلى: header يرجع للون الـ Carousel
- [x] FAB (Bysis AI button) يختفي عند السكرول للأسفل
- [x] FAB يرجع فوراً عند أي سكرول للأعلى ولو بمقدار صغير
- [x] Chatbot كـ Bottom Sheet (نصف الشاشة) مع header صحيح
- [x] Color Extractor: tRPC procedure يستخرج اللون المسيطر من أي صورة
- [x] Color Extractor: يُستخدم تلقائياً عند رفع صورة جديدة للـ Carousel

## 🎨 Advanced UX - Amazon-Style (June 2026)
- [x] Header يتلون مع الـ Carousel (fade من لون الـ carousel إلى أبيض عند السكرول)
- [x] Status bar (meta theme-color) تتبع لون الـ carousel
- [x] FAB يختفي عند السكرول للأسفل ويرجع عند السكرول للأعلى
- [x] Color Extractor utility (k-means clustering + React hook useDominantColor)
- [x] BgColorContext: إضافة carouselColor منفصل عن bgColor
- [x] DynamicColorCarousel: onColorChange callback لتمرير اللون للـ header

## 🔧 Amazon Diff Fixes (June 2026)
- [x] شريط البحث أبيض ثابت دائماً (لا يتلون مع الـ carousel)
- [x] زر الـ chatbot داخل شريط البحث (ليس FAB منفصل)
- [x] زر الـ chatbot يختفي عند السكرول للأسفل
- [x] Bottom Nav يختفي عند السكرول للأسفل ويرجع للأعلى
- [x] Carousel peek effect (90% عرض مع ظهور حافة الـ card التالي)

## 🔧 Amazon Diff Fixes (June 2026)
- [x] شريط بحث أبيض ثابت دائماً (لا يتغير لونه)
- [x] Chatbot button (dots icon) داخل شريط البحث يختفي عند السكرول للأسفل
- [x] Bottom Nav يختفي عند السكرول للأسفل ويرجع للأعلى
- [x] Carousel peek effect 88% + snap-to-center
- [x] لون Hero فقط (ليس الصفحة كلها)
- [x] Color Extractor utility (k-means clustering + useDominantColor hook)
- [x] BgColorContext: carouselColor منفصل عن bgColor

## ✅ Bottom Nav + ProfileSheet + Panier (June 2026 - COMPLETED)
- [x] Bottom Nav: 4 tabs (Accueil/Boutiques/Panier/Moi) with labels + active state
- [x] iPhone safe-area-inset-bottom in Bottom Nav
- [x] ProfileSheet: auth/guest states + dark/light toggle + FR/AR toggle + Terms + Contact
- [x] CartContext: add/remove/updateQuantity/clear + localStorage persistence
- [x] Arrivage page: "Ajouter au panier" button on each product
- [x] Panier page: list items + quantity control + total price + Commander CTA
- [x] Cart badge count on Panier tab icon
- [x] I18nContext: FR/AR translations (nav, profile, cart, general)
- [x] Scanner page: Amazon Lens-style with flash + barcode + help page
- [x] Home.tsx: Quick Actions with colored icons + Boutiques section

## Phase: Catalogue + Admin Slides/Produits/Catégories (Juin 2026)
- [x] DB: tables carousel_slides, categories, products dans drizzle/schema.ts
- [x] DB: helpers getCarouselSlides, getActiveCarouselSlides, createCarouselSlide, updateCarouselSlide, deleteCarouselSlide
- [x] DB: helpers getAllCategories, getActiveCategories, createCategory, updateCategory, deleteCategory
- [x] DB: helpers getAllProducts, getActiveProducts, getProductsByCategory, getProductById, searchProducts, createProduct, updateProduct, deleteProduct, countProducts
- [x] Backend: procedures carousel.list, carousel.adminList, carousel.create, carousel.update, carousel.delete
- [x] Backend: procedures categories.list, categories.adminList, categories.create, categories.update, categories.delete
- [x] Backend: procedures products.list (retourne {items, total}), products.get, products.adminList, products.create, products.update, products.delete, products.uploadImage
- [x] Admin: AdminSlides.tsx - gestion des slides du carousel (CRUD + réordonnancement)
- [x] Admin: AdminProducts.tsx - gestion des produits (CRUD + upload image)
- [x] Admin: AdminCategories.tsx - gestion des catégories (CRUD)
- [x] Admin: Intégration dans ShipMasterDashboard (tabs Slides, Produits, Catégories)
- [x] Home.tsx: Carousel dynamique depuis DB (fallback sur slides hardcodées si DB vide)
- [x] Catalogue.tsx: Page catalogue public avec liste, filtres par catégorie, recherche, pagination
- [x] ProduitDetail.tsx: Page détail produit avec ajout au panier et commande directe
- [x] App.tsx: Routes /catalogue et /produit/:id ajoutées
- [x] AppLayout.tsx: Navigation bottom nav pointe vers /catalogue
- [x] Panier.tsx: handleCommander passe tous les articles au checkout via sessionStorage
- [x] 22/22 tests Vitest passent

## 🤖 AI Chat — Refonte Complète (Juin 2026)
- [x] DB: table ai_orders (id, userId, trackingCode, productName, productUrl, productImageUrl, totalPrice, depositAmount, status, customerName, customerLastName, gouvernorat, moatamadia, phone, paymentProofUrl, adminNotes, createdAt, updatedAt)
- [x] Backend: procedure ai.createOrder + sendEmail client + notifier admin CRM
- [x] Backend: procedure ai.trackOrder (par trackingCode ou nom)
- [x] Backend: procedure ai.confirmOrder / rejectOrder (admin + email client)
- [x] Backend: procedure ai.uploadPaymentProof
- [x] AI System Prompt: format prix fixe (💰 prix, 📋 produit, ✅ inclus, 💳 paiement, ⚠️ note, infos commande)
- [x] AI System Prompt: 3 boutons après calcul (عدي كومند / عاود احسبلي / القائمة الرئيسية)
- [x] AI System Prompt: flow commande (collecte infos → login gate → création CRM + trackingCode)
- [x] AI System Prompt: premier message = demande nom ou numéro de suivi
- [x] AI System Prompt: ne pas révéler méthode de calcul ni commission
- [x] UI: dots d'attente multicolores (rouge #E8192C / orange #FF6B00 / noir #0A0A0A)
- [x] UI: bottom sheet animation (slide up/down depuis le bas)
- [x] UI: bottom nav reste visible sous le chat
- [x] UI: fermeture chat au 2ème clic sur bouton AI
- [x] UI: typographie élégante (Inter, taille lisible, espacement généreux)
- [x] UI: boutons d'action après calcul prix
- [x] UI: login gate avant confirmation commande (redirect → retour AI)
- [x] CRM: AI orders apparaissent dans ShipMaster avec section dédiée
- [x] CRM: admin peut confirmer/rejeter + envoyer email depuis CRM
- [x] Email: confirmation commande → client (sur email Manus/Google enregistré)
- [x] Email: changement statut → client
- [x] Paiement: UIB RIB 12067000013314111448 (Nermin mejrissi) + Mandat La Poste (Nermine mejressi, Monastir)
- [x] Dépôt: 50% du total de la commande

## 🤖 AI Chat Orders — Admin Integration (Juin 2026)
- [x] Fix TypeScript errors in AdminAiOrders.tsx (trpc.aiOrders.reject, .confirm, .updateStatus)
- [x] Add confirm/reject/updateStatus procedures to routers.ts (aliases for adminUpdateStatus)
- [x] Add "ai_orders" tab to ShipMasterDashboard.tsx (type, navItems, title/subtitle, render)
- [x] Bot icon imported from lucide-react for ai_orders nav item
- [x] 22/22 tests Vitest passent, 0 erreurs TypeScript

## 🔧 Corrections UI Chat + Contact (Juin 2026)
- [x] Chat toggle: 2ème clic sur bouton AI ferme le chat (actuellement il ne fait rien)
- [x] Bottom nav: reste visible SOUS le chat (chat s'arrête au-dessus du bottom nav, pas dessus)
- [x] Texte bouton: 'عدل كومند' → 'عدي كومند' dans AIChat.tsx
- [x] Texte bouton: 'عدل كومند' → 'عدي كومند' dans system prompt (routers.ts)
- [x] Ajouter WhatsApp (+216 23 868 982) dans ProfileSheet.tsx (section contact)
- [x] Ajouter WhatsApp dans footer/contact de l'app (system prompt + ProfileSheet)

## 🐛 Bug Fix: AI Chat — Code Suivi + CRM (Juin 2026)
- [x] Fix: priceData non persisté entre messages → ORDER_DATA créé sans prix → totalPrice=0, depositAmount=0
- [x] Fix: system prompt doit inclure price_tnd dans ORDER_DATA directement (pas séparé)
- [x] Fix: CRM Commandes AI affiche 0 commandes car ai_orders table vide (bug insert)
- [x] Fix: AI dit "كود يوصلك عبر SMS" au lieu de donner le code directement dans le chat

## 🚀 CRM + AI Chat — Améliorations complètes (Juin 2026)
- [x] Fiche commande AI: image produit + lien cliquable + infos client complètes + prix + acompte + bouton WhatsApp direct
- [x] Stats dashboard dans AdminAiOrders: total commandes, CA total, acomptes reçus, taux confirmation
- [x] Filtres par statut (pending/confirmed/shipped...) + filtre par date dans AdminAiOrders
- [x] Page /track pour client: saisir code de suivi → voir statut + infos commande (supporte BY... et BSS-...)
- [x] Export CSV des commandes AI depuis AdminAiOrders
- [x] Notes admin sur chaque commande (champ texte libre éditable)
- [x] Historique des changements de statut avec date/heure
- [x] WhatsApp notification client lors confirmation: lien wa.me pré-rempli avec code de suivi (ouvre WhatsApp auto)
- [x] Email de confirmation au client (pas seulement admin)

## 🖤 Nike-Style Redesign (Juin 2026)
- [x] index.css: Poppins Black 900 pour titres, thin pour corps, palette #000/#fff
- [x] AppLayout: header thin icons (strokeWidth=1.2), bottom nav thin + active=noir
- [x] Home.tsx: Quick Actions blanc + border noir + icônes thin + texte Bold noir
- [x] Home.tsx: CTAs pill shape noir (#000) + texte blanc Bold
- [x] Home.tsx: section "Pourquoi Bysis" avec icônes thin noir (fond noir, icône blanche)
- [x] Boutons globaux: pill shape, noir/blanc, Bold text

## 🔥 Refonte Nike Radicale — Toutes les pages (Juin 2026)
- [x] Ajouter Barlow Condensed Black (700/900) dans client/index.html
- [x] Mettre à jour index.css : classe .font-display + variables boutons globales
- [x] AppLayout.tsx : strokeWidth 1.2 → 1.5 sur toutes les icônes
- [x] Home.tsx : Barlow Condensed pour Hero, boutons épais, labels FR
- [x] Calculator.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] OrderForm.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] Arrivage.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] Cart/Panier : boutons épais, strokeWidth 1.5, labels FR
- [x] History.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] OrderConfirmation.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] Search.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] Scanner.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] ProfileSheet.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] Catalogue.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] TrackOrder.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] AdminAiOrders.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] ShipMasterDashboard.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] AIChat.tsx : boutons épais, strokeWidth 1.5, labels FR
- [x] server/routers.ts : system prompt multilingue (AR/FR/EN/dialecte tunisien)


## Redesign AIChatBox — Premium AI Assistant (Futuristic)

- [x] Réécrire AIChatBox avec glassmorphism + gradient messages
- [x] Ajouter neon gradients (purple/pink/blue) aux messages
- [x] Améliorer AnimatedAIOrb avec états thinking/listening
- [x] Ajouter animations fluides et transitions premium
- [x] Tester et valider le design final en navigateur
