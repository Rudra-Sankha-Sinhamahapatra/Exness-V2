# Exness

## Architecture

The system is built as a set of microservices that communicate via **Redis Queues** and **Redis Streams**.
This ensures high-throughput, low-latency communication between services, while keeping the design modular and fault-tolerant.

<img src="./docs/images/main.png" alt="System Architecture Diagram" width="800"/>

### Components

* **Server**
  Express.js backend that exposes HTTP APIs for user requests (balances, trades, wallet initialization).
  Communicates with the Engine using Redis **queues**.
  Performs direct reads from Main DB for authentication and asset validation.

* **Engine**
  Core trading engine that:

  * Maintains in-memory state (asset prices, balances, trades)
  * Processes all trade and wallet requests from the Server (via Redis queues)
  * Consumes real-time price updates from Redis **streams**
  * Queues write operations to DB Processor via Redis streams
  * Restores state from snapshots on startup

* **DB Processor**
  Dedicated database write service that:

  * Consumes write operations from Redis streams
  * Handles trade creation/updates in Main DB
  * Processes snapshot data and writes to Snapshot DB
  * Provides batch processing for high-throughput scenarios

* **Price Poller**
  Connects to Backpack WebSocket API to fetch live prices.
  Batches updates and pushes them into Redis **streams** (`price_stream`).

* **Database (PostgreSQL)**
  
  * **Main DB**: Stores users, trades, and assets using Prisma ORM
  * **Snapshot DB**: Stores periodic snapshots of engine state for recovery

* **Redis**

  * **Queues (Lists)**:

    * `server → engine`: request queue for trade/wallet operations
    * `engine → server`: response queue for results/errors
  * **Streams**:

    * `price_stream`: high-frequency price updates from poller to engine
    * `db_operations_queue`: write operations from engine to DB processor
    * `snapshot_queue`: snapshot data from engine to DB processor

### Data Flow

1. **Server → Engine (RPC via Redis Queues)**
   * Server receives user requests (trade execution, wallet operations)
   * Pushes request into Redis **queue** (`trade_stream`, `user_wallet_stream`) with unique response channel
   * Engine consumes, processes, and pushes results back to response queue

2. **Price Poller → Engine (Streaming via WebSocket + Redis)**
   * Poller connects to Backpack **WebSocket** feed (not REST API)
   * Publishes batched price updates into Redis **streams** (`price_stream`)
   * Engine consumes stream updates with consumer groups for reliability

3. **Engine → DB Processor (Async Write Operations)**
   * Engine queues trade operations to `db_operations_queue` stream
   * Engine queues snapshots to `snapshot_queue` stream
   * DB Processor consumes from both streams concurrently
   * Separates Main DB writes (trades) from Snapshot DB writes (state recovery)

4. **Engine State & Persistence**
   * Engine holds in-memory state for ultra-low latency
   * Periodically queues snapshots every 20 seconds via Redis streams
   * On restart, Engine restores state from latest snapshot in Snapshot DB

5. **Database Operations**
   * **Server Direct Reads**: Authentication, asset validation (immediate response needed)
   * **DB Processor Writes**: Trade creation/updates, user creation, snapshots (async)
   * **Engine Startup**: Snapshot restoration from Snapshot DB

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

