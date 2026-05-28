# Aegis-Nexus 🛡️🔄

Aegis-Nexus is a high-performance, non-custodial decentralized application (dApp) engineered for the **LitVM Network (LiteForge Environment)**. It empowers users to execute advanced on-chain conditional **Dollar-Cost Averaging (DCA)** strategies safely and efficiently without relinquishing control of their private keys.

---

## 🚀 Key Features

*   **Non-Custodial Escrow System:** Your assets remain locked inside an automated, secure smart contract architecture until your exact target parameters are met.
*   **Target Price Thresholds:** Protect your purchasing power by setting maximum execution prices (`targetPrice`) for your automated buys.
*   **Flexible Lifecycle & Frequency:** Customize intervals (Daily, Weekly, Monthly) and precise purchase allocations seamlessly.
*   **Symmetric UI Panel:** Features an interactive live network price ticker, a real-time Strategy Projection Calculator, and single-click token address auto-fill capabilities.

---

## 🛠️ Tech Stack & Architecture

*   **Frontend Framework:** Next.js 14 (App Router)
*   **Web3 & Wallet Interaction:** RainbowKit (v2) & Wagmi (v2)
*   **Ethereum Library:** Viem (v2)
*   **State Management:** TanStack React-Query (v5)
*   **Styling & Icons:** Tailwind CSS & Lucide React

---

## 💻 System Configuration & Deployment

### Network Details (LiteForge Testnet)
*   **Chain ID:** `4441`
*   **Network Name:** `LitVM LiteForge`
*   **Native Currency:** `zkLTC` (18 Decimals)
*   **RPC URL:** `https://liteforge.rpc.caldera.xyz/http`
*   **Block Explorer:** `https://liteforge.explorer.caldera.xyz`

### Environment Variables
To run this project locally, ensure you have a `.env.local` file containing:
```env
NEXT_PUBLIC_WALLET_CONNECT_ID=43d7ee824429abab38313a30c5e39be1
NEXT_PUBLIC_CONTRACT_ADDRESS=0xC06F6eB12037c6a95D5B7199237356E0d6e74D8C

git clone [https://github.com/GENESIS-SOARES17/Aegis-Nexus.git](https://github.com/GENESIS-SOARES17/Aegis-Nexus.git)
    cd Aegis-Nexus
    ```

2.  **Install dependencies (using peer dependency legacy resolution):**
```bash
    npm install --legacy-peer-deps
    ```

3.  **Run the development server:**
```bash
    npm run dev
    ```
Open [http://localhost:3000](http://localhost:3000) on your browser to interact with the dApp.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---
*Developed with 🛠️ on Linux Mint by [GENESIS-SOARES17](https://github.com/GENESIS-SOARES17).*
