# Amazon SecondLife - Circular Commerce Operating System

> **A production-grade AI-powered circular economy platform** — transforming e-commerce returns from an $800B cost center into a sustainable, value-generating ecosystem. Built with Multi-Agent Nova AI, Computer Vision Condition Grading, Hyperlocal P2P Matching, and Dynamic Digital Twins.

**HackOn with Amazon 2026**
**Team KD:** Devanshi Singal & Kshitij Chatap (IIIT Allahabad)

---

## Table of Contents

1. [Problem Statement & Relevance](#problem-statement--relevance)
2. [Architecture & Tech Stack](#architecture--tech-stack)
3. [Feature Overview](#feature-overview)
4. [AI Modules (Nova Ecosystem)](#ai-modules-nova-ecosystem)
5. [User Journeys](#user-journeys)
6. [Quick Start & Deployment](#quick-start--deployment)
7. [Database Schema](#database-schema)
8. [Future Vision & Scaling](#future-vision--scaling)

---

## Problem Statement & Relevance

### The $800 Billion Returns Crisis
Every year, more than 30% of products purchased online are returned, creating over $800 billion in global return costs. Many of these products remain fully functional, yet they are discarded, liquidated at heavy losses, or sent through expensive reverse-logistics networks before finding a second owner.

At the same time, customers hesitate to purchase refurbished or second-hand products due to concerns around quality, authenticity, and product condition. This creates a massive gap between reusable inventory and potential buyers.

Without intervention, return volumes are projected to surpass $1.2 trillion annually by 2030, making sustainable resale and circular commerce increasingly critical.

### The SecondLife Solution
Amazon SecondLife directly addresses the AI-Powered Returns & Sustainable Resale challenge by creating an intelligent ecosystem that gives every product a meaningful second life.

Most existing resale platforms only become involved after a product has already been returned, refurbished, or listed for resale. Amazon SecondLife introduces a first-of-its-kind AI-orchestrated circular commerce ecosystem that actively manages a product's entire lifecycle. Instead of treating returns as waste, the platform uses AI to determine whether an item should be:
* Resold via P2P
* Refurbished
* Exchanged
* Donated to NGOs
* Recycled

---

## Architecture & Tech Stack

Amazon SecondLife is designed for 1000x scaling and enterprise-grade reliability.

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16 (App Router), React 19, Tailwind CSS, Framer Motion, Recharts |
| **Backend** | Next.js Server Actions, Node.js, REST API |
| **Database** | PostgreSQL (via Vercel Postgres), Prisma ORM |
| **AI / ML** | Amazon Bedrock (Multi-agent reasoning), Amazon Rekognition (Computer Vision), Groq (LLM Fallback) |
| **Auth** | NextAuth / JWT, Role-based access control (Customer, Seller, Enterprise, Admin) |
| **Mapping** | H3 Geospatial Clustering, Leaflet |
| **Cloud** | AWS S3 (Storage), Vercel (Deployment), AWS Lambda + EventBridge |

---

## Feature Overview

### Core Features

1. **Smart Return Wizard:** 5-step frictionless return flow with photo uploads and live AI assessment.
2. **AI Vision Condition Grading:** Computer vision detects damage and assigns ISO-style grades (A+ to F).
3. **Hyperlocal P2P Matchmaking:** Matches local buyers and sellers within the same city using H3 geospatial indexing.
4. **The Witness Panel:** AI-generated persona of the previous owner that answers buyer questions about product history.
5. **Return Intent Predictor (RIP):** Predicts return likelihood before purchase using ML behavioral analysis.
6. **Eco Pickup Routing:** Dynamic logistics optimization to piggyback return pickups on active delivery routes.
7. **Digital Product Passport:** Immutable lifecycle timeline and chain of custody for every product.
8. **Circular Marketplace:** Multi-channel resale including Certified Preloved, Rental, Exchange, and Donation.
9. **Smart Size Advisor:** Reduces apparel returns by cross-referencing buyer preferences and historical sizing.
10. **Green Credit DeFi Wallet:** Rewards sustainable behavior with tradeable Nectar Credits backed by carbon savings.
11. **ESG Enterprise Dashboard:** Tracks platform-wide carbon savings, water conservation, and waste diverted.
12. **Return Fraud Detector:** Real-time anomaly detection for wardrobing and switch fraud.

---

## AI Modules (Nova Ecosystem)

Amazon SecondLife is powered by the **Nova AI Ecosystem**, a multi-agent architecture handling thousands of product decisions simultaneously.

### 1. Return Intent Predictor (RIP)
* **Purpose:** Predict likelihood of return before a purchase is confirmed.
* **How it works:** Compiles buyer's return history, sizing patterns, and session behavior (time on page, comparisons). Produces a risk probability score shown as a gauge at checkout.
* **Impact:** Expected 25-40% reduction in preventable returns.

### 2. Nova Vision Agent (Condition Grading)
* **Purpose:** Assess physical condition of returned items using computer vision.
* **How it works:** Analyzes uploaded photos to identify damage type, location, and severity. Assigns an ISO-style grade (A+ -> Like New, C -> Fair, F -> For Parts) and generates a certified Product Health Card.

### 3. Nova Demand Agent (Hyperlocal Matching & Pricing)
* **Purpose:** Match resale listings to the highest-propensity local buyers and set dynamic prices.
* **How it works:** Uses H3 geospatial indexing to cluster buyers. Evaluates category affinity, location proximity, and price sensitivity. Calculates dynamic prices using depreciation forecasts (Digital Twins) projecting value at 3, 6, and 12 months.

### 4. Nova Decision Agent (Refurbishment & Routing)
* **Purpose:** Decide the most profitable and sustainable path for an item.
* **How it works:** Evaluates a 4-route decision matrix (Resell, Refurbish, Donate, Recycle) using condition grade, carbon savings potential, and logistics cost. Automatically matches low-value items to verified NGOs.

### 5. Nova Trust Agent (Return Fraud Detector)
* **Purpose:** Detect and prevent return fraud in real time.
* **How it works:** Three-layer architecture analyzing behavioral history, transaction patterns, and anomaly detection to classify fraud types (empty box, wardrobing). Reduces false claims by 60-80%.

---

## User Journeys

### Journey 1: Customer Return Flow
1. **Initiate:** User selects a recently purchased item from their Digital Product Passport.
2. **Upload:** User uploads photos of the item and packaging via the Smart Return Wizard.
3. **Inspection:** Nova AI runs a live pipeline: Uploading -> Vision Analysis -> Damage Detection -> Condition Grading -> Buyer Matching.
4. **Decision:** System presents the optimal path (e.g., direct P2P sale to a local buyer, or NGO donation).
5. **Completion:** User accepts the path and earns Nectar Credits.

### Journey 2: Marketplace Purchase
1. **Browse:** User explores the Circular Marketplace and finds a refurbished item.
2. **Investigate:** User opens "The Witness Panel" to chat with the AI representation of the previous owner to ask about battery health and scratches.
3. **Checkout:** The modal displays the Return Risk Gauge (RIP) and Smart Size Advice to ensure confidence.
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
Create a `.env` file in the root directory:
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

## Database Schema

Key entities powering the platform:

* **Product:** Base catalog items (Name, Brand, MSRP).
* **TradeIn:** Return cases with lifecycle status, geolocation, and seller notes.
* **ProductHealthCard:** AI condition scores, damage analysis, and authenticity verification.
* **Order / P2PMatch:** Transaction logic and buyer/seller relationships.
* **Donation / NGO:** Verified organizations and impact tracking (Carbon Saved, Waste Diverted).
* **Wallet / Transactions:** Nectar Credit ledger and tokenized environmental rewards.

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
