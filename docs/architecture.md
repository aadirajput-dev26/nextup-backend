# NextUp Architecture

## 🎯 Purpose
NextUp is a platform that connects **Students** and **Organisations**.  
- Organisations post **Opportunities** (internships, scholarships, events).  
- Students can **apply to opportunities**, **collaborate on projects**, and **exchange skills** using a coin‑based economy.  
- The system tracks **connections, transactions, notifications, and skillswaps** to build a social and learning network.

---

## 🗄️ Entities
Schemas are already defined in `/models`. The key entities are:
- **Students** → profiles, education, coin balance, collaborations, skillswaps, connections.  
- **Organisations** → company/NGO accounts, posted opportunities.  
- **Opportunities** → internships, scholarships, events.  
- **Collaborations** → student‑driven project requests.  
- **Skillswap** → peer learning and coin exchange.  
- **Transactions** → coin transfer logs.  
- **Connections** → student‑to‑student social graph.  
- **Notifications** → alerts for actions (new opportunity, accepted collaboration, coin transfer).  

---

## 🔗 Relationships
- Students ↔ Opportunities → Students apply, Organisations post.  
- Students ↔ Collaborations → Students initiate and join.  
- Students ↔ Skillswap → Peer learning + coin exchange.  
- Transactions ↔ Students → Coin transfers between students.  
- Connections ↔ Students → Social graph of requests/acceptances.  
- Notifications ↔ All → Engagement layer triggered by actions.  

---

## 🔑 What Needs to Be Built
Since DB schemas are complete, AI should generate:
1. **Authentication & Authorization**
   - JWT middleware for Students and Organisations.
   - OAuth (GitHub, LinkedIn).
   - Role‑based access control.

2. **Controllers & Routes**
   - Students: signup, login, profile update, coin balance update.
   - Organisations: signup, login, post/manage opportunities.
   - Opportunities: CRUD, apply, list applicants.
   - Collaborations: CRUD, apply, accept collaborators.
   - Skillswap: CRUD, accept, complete, feedback.
   - Transactions: auto‑create on coin transfer.
   - Connections: send request, accept/reject.
   - Notifications: create on key actions.

3. **Business Logic**
   - Coin balance updates tied to Transactions.
   - Status lifecycle for Collaborations and Skillswap (open → accepted → completed).
   - Prevent duplicate applications or requests.
   - Ensure Organisations can only post opportunities, not join collaborations.

4. **Testing & CI/CD**
   - API testing with Postman/BlazeMeter.
   - Load testing for Opportunities/Collaborations endpoints.
   - GitHub Actions for automated testing + Vercel deployment.

5. **Frontend Integration**
   - RESTful APIs with clear JSON responses.
   - Endpoints documented for frontend consumption.
   - Avatar handling: default vs uploaded profile photo/logo.

---

## 📂 Folder Structure
/backend 
    /controllers   # business logic 
    /models        # mongoose schemas 
    /routes        # API endpoints 
    /services      # reusable functions 
    /middlewares   # auth, validation 
    /utils         # helpers
    /config        # to config DB and other essentials

---

## 🌐 Deployment
- GitHub repo connected to Vercel.  
- Environment variables managed in Vercel dashboard.  
- CI/CD pipeline ensures auto deploy on push.  

---

## 📌 Current Status
- ✅ DB schemas completed.  
- 🚧 Next step: deploy base server to Vercel.  
- 🔜 Upcoming: build endpoints and controllers around schemas.  