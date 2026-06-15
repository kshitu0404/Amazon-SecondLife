# Amazon SecondLife - Circular E-Commerce Operating System

> **A production-grade AI-powered circular economy platform** — transforming e-commerce returns from an $800B cost center into a sustainable, value-generating ecosystem. Built with Multi-Agent Nova AI, Computer Vision Condition Grading, Hyperlocal P2P Matching, and Dynamic Digital Twins.

**HackOn with Amazon 2026**
**Team KD:** Devanshi Singal & Kshitij Chatap (IIIT Allahabad)

---

## Table of Contents

1. [Problem Statement & Relevance](#problem-statement--relevance)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Core Technical Innovations & Logic](#core-technical-innovations--logic)
4. [The Nova AI Engine (Multi-Agent Brain)](#the-nova-ai-engine-multi-agent-brain)
5. [Deep Dive: Core Features](#deep-dive-core-features)
6. [User Journeys](#user-journeys)
7. [Quick Start & Deployment](#quick-start--deployment)
8. [Future Vision & Scaling](#future-vision--scaling)

---

## Problem Statement & Relevance

### The $800 Billion Returns Crisis
Every year, millions of returned products are treated like waste, even when they still have real value. More than 30% of online purchases are returned, costing retailers billions and generating massive carbon emissions from reverse logistics. Perfectly usable products are discarded or shipped thousands of miles simply because there is no intelligent system to route them efficiently. 

At the same time, customers hesitate to buy refurbished products due to uncertainty. Buying a used product feels like a mystery, creating a massive gap between reusable inventory and willing buyers.

### The SecondLife Solution
Amazon SecondLife directly addresses this by building an operating system for circular commerce. Instead of letting products end up in costly reverse logistics or landfills, our platform gives every item a smarter second life. It actively decides whether a product should be resold locally, refurbished, donated, recycled, or matched directly to a new buyer—preventing waste before it even happens.

---

## Architecture & Tech Stack

Amazon SecondLife is designed with a production-style backbone, not just a demo UI.

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion, Recharts |
| **Backend Core** | Next.js Server Actions, Node.js, REST API |
| **Database** | PostgreSQL (via Vercel Postgres), Prisma ORM |
| **AI Reasoning** | Amazon Bedrock (Multi-agent architecture), Groq (Resilient fallback layer) |
| **Computer Vision** | Amazon Rekognition (Condition scanning and fraud prevention) |
| **High-Throughput** | Amazon DynamoDB (Journey and timeline data) |
| **Cloud & Storage** | AWS S3 (Product and passport assets), Vercel, AWS CloudWatch (Observability) |
| **Mapping** | H3 Geospatial Clustering, Leaflet |

---

## Core Technical Innovations & Logic

Amazon SecondLife is built on rigorous algorithmic foundations that drive real-world circular economies.

### 1. Dynamic Radius Matcher (H3 Geospatial Clustering)
Instead of returning items to a centralized warehouse, the `Matcher Engine` performs an asynchronous dynamic, expanding radius search using Uber's H3 Hexagonal Hierarchical Spatial Index.
* **Logic:** The engine starts at ring size `k=0` (the exact same hexagon cell as the returner). It executes an isolated database transaction to locate an unfulfilled, matching order. If no buyer is found, the loop expands outward incrementally to `k=50` (approx. 50km radius).
* **Impact:** Radically reduces shipping distances by up to 90%, slashing carbon emissions and allowing the product to re-enter use much faster.

### 2. Autonomous Resale Agent (ARA)
The ARA engine autonomously scans user inventories to predict the exact optimal time to sell or donate idle items.
* **Logic:** The agent filters for "liquid" categories (electronics, apparel). It computes the depreciation rate using the Digital Twin engine. If the `monthly_decay_pct >= 2%`, the ARA flags the item as "sell_now" to prevent value loss. If the current value dips below $15, it flags it for "donate" to maximize NGO impact.
* **Impact:** Prevents products from sitting idle in closets until they become electronic waste by pushing proactive push notifications to the user.

### 3. Digital Product Twins & Pricing Depreciation
The pricing engine simulates the financial depreciation of every item across 3, 6, and 12-month horizons to optimize secondary market liquidity.
* **Logic:** The engine scales Base MSRP by the AI Condition Grade (A+ retains 90%, B retains 60%, etc.). It then calculates geometric depreciation: `Depreciation = Math.pow(1 - (monthlyDepreciation / 100), ageMonths)`.
* **Impact:** Generates highly accurate fair-market pricing and triggers predictive End-of-Life (EOL) alerts before an item drops to zero value.

### 4. Computer Vision Condition Scan
Returns are no longer processed blindly. The platform utilizes advanced computer vision pipelines to analyze the physical state of every item the moment a return is initiated.
* **Logic:** Uploaded images are passed through Amazon Rekognition to detect structural integrity, cosmetic damage, and packaging condition. The engine cross-references this visual data against historical product baselines to assign a standardized ISO-style condition grade.
* **Impact:** Eliminates manual warehouse inspections, speeds up refunds, and generates certified trust signals for the next buyer instantly.

### 5. Smart Routing Engine
The platform dynamically calculates the optimal physical destination for every single item to ensure it creates the most value with the least waste.
* **Logic:** The engine runs a multi-variate evaluation matrix weighing product condition, local demand velocity, logistics transportation costs, fraud risk, and environmental value. 
* **Impact:** Bypasses central warehouses entirely. High-condition items are routed P2P; damaged items are routed to refurbishment partners; low-value items are routed to verified NGOs.

---

## The Nova AI Engine (Multi-Agent Brain)

At the center of the system is Nova AI. Nova is not just a chat assistant; it acts as the multi-agent brain orchestrating the entire platform. Instead of one generic response, Nova splits tasks across specialized agents to decide the best next step for the product itself.

* **The Vision Agent:** Handles instant condition scanning, extracting damage reports and assigning grades from user-uploaded photos.
* **The Routing Agent:** Evaluates local demand and logistics costs to dynamically decide if an item should be resold, donated, or recycled.
* **The Trust Agent:** Constantly monitors transaction patterns and behavioral anomalies to detect and block return fraud (wardrobing, empty box returns) in real time.
* **The Prevention Agent:** Predicts return behavior before checkout by analyzing buyer history and sizing mismatch risks.
* **The Demand Agent:** Estimates product demand and dynamically adjusts resale pricing to ensure inventory doesn't stagnate.

---

## Deep Dive: Core Features

* **Circular Marketplace:** A clean, premium shopping experience where users browse pre-owned items. Every product card is enriched with trust signals, AI pricing, and circular-commerce context, ensuring buyers aren't just shopping—they are transparently seeing the product's next lifecycle.

* **Pre-Checkout Return Risk Prediction:** Not every return starts after the purchase; we stop waste before it starts. Before checkout, our ML models analyze buyer history and product risk to estimate the likelihood of a future return, guiding the buyer better and flagging risky transactions early.

* **Smart Return Wizard:** Instead of a plain return form, this intelligent wizard actively guides the customer. It asks for product photos, packaging details, and condition data, allowing the platform to instantly decide whether the item should be resold, refurbished, donated, or recycled—preventing default routing to landfills.

* **Digital Product Passport:** After inspection, the product receives a permanent lifecycle identity card. This passport stores the condition grade, inspection results, and full product history. Instead of buying a mystery used product, the customer sees a verified record that builds absolute trust.

* **The Witness Panel:** To solve the uncertainty of resale, buyers can directly ask contextual questions (e.g., "Why was this returned?", "How is the battery?") to an AI-generated representation of the previous owner. It replaces generic reviews with transparent, item-specific history.

* **Hyperlocal P2P & Logistics Command Center:** The platform attempts to bypass centralized warehouses entirely. If a nearby buyer exists, the product is matched locally. This command center monitors live P2P matches, dramatically reducing shipping distances and lowering reverse-logistics costs.

* **Circular Wallet & Green Credits:** Sustainability is not hidden; it is measured and rewarded. Every good action earns value back into the Circular Wallet. Users track their Green Credits, carbon saved, and trust scores, turning sustainable behavior into a tangible, rewarding economy.

* **Real-Time Impact Tracker:** A live dashboard visualizing the platform's exact environmental achievements. It tracks carbon prevented, waste diverted, items recirculated, and total economic value recovered—proving that circular commerce is both scalable and highly impactful.

---

## User Journeys

### Journey 1: Customer Return Flow
1. **Initiate:** User selects a recently purchased item from their Digital Product Passport.
2. **Upload:** User uploads photos of the item and packaging via the Smart Return Wizard.
3. **Inspection:** Nova AI runs a live pipeline: Uploading -> Vision Analysis -> Damage Detection -> Condition Grading -> Buyer Matching.
4. **Decision:** System presents the optimal path (e.g., direct P2P sale to a local buyer, or NGO donation).
5. **Completion:** User accepts the path and earns Green Credits.

### Journey 2: Marketplace Purchase
1. **Browse:** User explores the Circular Marketplace and finds a refurbished item.
2. **Investigate:** User opens "The Witness Panel" to chat with the AI representation of the previous owner to ask about battery health and scratches.
3. **Checkout:** The modal displays the Return Risk Gauge and Smart Size Advice to ensure confidence.
4. **Acquire:** Purchase completes. The Digital Product Passport transfers to the new owner.

### Journey 3: Enterprise ESG Reporting
1. **Access:** Enterprise admin logs into the Logistics Command Center.
2. **Monitor:** Views live metrics on Circular GMV, CO2 saved, waste diverted, and donation impact.
3. **Optimize:** Analyzes logistics dashboard showing Eco Pickup Routing efficiency and reduced transportation emissions.

---

## Quick Start & Deployment

### Prerequisites
* Node.js 18+
* PostgreSQL Database (e.g., Vercel Postgres)

### 1. Clone & Install
```bash
git clone https://github.com/kshitu0404/Amazon-SecondLife.git
cd Amazon-SecondLife
npm install
```

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
DATABASE_URL="postgresql://user:password@host/db"
POSTGRES_URL="postgresql://user:password@host/db"
GROQ_API_KEY="your-api-key"
# Add AWS credentials for Bedrock/S3 if fully enabling AWS features
```

### 3. Database Migration & Seeding
```bash
npx prisma db push
npx prisma generate
npx prisma db seed
```
*(The seed script populates the database with over 1000 mock products, trade-ins, and users).*

### 4. Run Locally
```bash
npm run dev
```
Navigate to `http://localhost:3000`.

---

## Future Vision & Scaling

Amazon SecondLife is architected to evolve into the operating system for global circular commerce.

**Scaling Strategy:**
* **Compute:** Stateless AWS Lambda execution for infinite horizontal scaling.
* **Data:** DynamoDB Global Tables for multi-region replication.
* **Logistics:** H3-based locality matching and route optimization.

**Roadmap Horizons:**
* **0-3 Months:** Launch MVP beta in major tech hubs (Bangalore, Seattle, Mumbai).
* **6-12 Months:** Expand NGO Portal and integrate global third-party Seller Copilot APIs.
* **12-24 Months:** Multi-segment expansion beyond e-commerce into Enterprise IT Asset Recovery ($35B+ market), Automotive Components, and Healthcare Equipment.

**Target Impact:**
At full scale, Amazon SecondLife aims to achieve:
* 100 Million+ Users Impacted
* 1 Billion+ Products Given A Second Life
* ₹50,000+ Crore Product Value Recovered
* 25 Million Tons CO₂ Emissions Prevented
* 80% Reduction In Reverse Logistics Costs

---
*Built with dedication for HackOn with Amazon 2026*
