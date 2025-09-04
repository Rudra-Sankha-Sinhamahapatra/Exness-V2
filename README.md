# Exness

## Architecture

The system is built as a set of microservices that communicate via **Redis Queues** and **Redis Streams**.
This ensures high-throughput, low-latency communication between services, while keeping the design modular and fault-tolerant.

<img src="./docs/images/main.png" alt="System Architecture Diagram" width="800"/>

### Components

* **Server**
  Express.js backend that exposes HTTP APIs for user requests (balances, trades, wallet initialization).
  Communicates with the Engine using Redis **queues**.

* **Engine**
  Core trading engine that:

  * Maintains in-memory state (asset prices, balances, trades)
  * Processes all trade and wallet requests from the Server (via Redis queues)
  * Consumes real-time price updates from Redis **streams**
  * Periodically snapshots state into PostgreSQL for persistence

* **Price Poller**
  Connects to Backpack WebSocket API to fetch live prices.
  Batches updates and pushes them into Redis **streams** (`price_stream`).

* **Database (PostgreSQL)**
  Used to persist snapshots of engine state (balances, open/closed trades).
  Allows engine recovery on restart.

* **Redis**

  * **Queues (Lists)**:

    * `server → engine`: request queue for trade/wallet operations
    * `engine → server`: response queue for results/errors
  * **Streams**:

    * `price_stream`: high-frequency price updates from poller to engine

### Data Flow

1. **Server → Engine (RPC)**

   * Server receives user requests (trade execution, wallet operations).
   * Pushes request into a Redis **queue** with a unique response channel.
   * Engine consumes, processes, and pushes results back to response queue.

2. **Price Poller → Engine (Streaming)**

   * Poller subscribes to Backpack WebSocket feed.
   * Publishes batched price updates into Redis **streams**.
   * Engine consumes stream updates with consumer groups for reliability.

3. **Engine State & Persistence**

   * Engine holds in-memory state for ultra-low latency.
   * Periodically takes snapshots of trades/balances and writes them into PostgreSQL.
   * On restart, Engine restores its state from the latest snapshot.

4. **Server & DB , Engine & DB**
     
   * During Signup We store user details on DB, signin we check existing Check
   * The Assets which are supported in our platform we store on DB
   * During create trades we insert data on DB, closed trades we update data on DB

---

## Tech Stack

* **Backend**

  * Node.js + Express.js
  * Bun Runtime
  * Redis (Queues + Streams)
  * PostgreSQL (With Prisma ORM for main DB , Pg library for snapshots)
  * Resend (For Mailing)


## Backend System

* **Database Design**

  * Main Database Schema(PostgreSQL with Prisma)
  * Snapshot Database(PostgreSQL with Pg)

<h4>Main Database Schema(PostgreSQL with Prisma)</h4>

  <img src="./docs/images/mainDB.png" alt="Main Database Architecture Diagram" width="800"/>

<h4>Snapshot Database(PostgreSQL with Pg)</h4>

  <img src="./docs/images/snapshotDb.png" alt="Snapshots Database Architecture Diagram" width="800"/>


* **Communication**

  * Redis Queues for RPC-style request/response (Server ↔ Engine)
  * Redis Streams for high-frequency market data (Poller → Engine)
  * WebSocket for external Backpack market feed

* **Features**

  * Leveraged trading with customizable margin
  * Auth Verification mail through mail via Resend
  * Real-time price ingestion via Redis Streams
  * PnL calculation with liquidation handling
  * Balance management
  * Trade execution and settlement
  * State persistence with snapshots to PostgreSQL
  * Main Database to store Users,ExistingTrades & Assets for persistense

