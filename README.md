# EduTrust

EduTrust is a decentralized application (dApp) designed to manage and verify educational credentials using blockchain technology. This codebase includes a backend for handling credential issuance and NFT-based certification, as well as a frontend for user interaction.

## Table of Contents
- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
  - [Backend](#backend)
  - [Frontend](#frontend)
- [Contributing](#contributing)
- [License](#license)

## Overview

EduTrust leverages blockchain technology to provide a secure, transparent, and tamper-proof system for issuing, storing, and verifying educational credentials. The backend integrates with a blockchain network to mint credentials as NFTs (Non-Fungible Tokens), while the frontend offers an intuitive interface for users to interact with the system.

## Project Structure

The repository is divided into two main directories:

```
EduTrust/
├── credential-dapp-backend/  # Backend for credential management and blockchain integration
└── frontend/                 # Frontend user interface
```

### credential-dapp-backend/
- `CredentialNFT.json`: ABI or contract definition for the Credential NFT smart contract.
- `blockchain.config.js`: Configuration for blockchain network connectivity.
- `controllers/`: Logic for handling requests and responses.
- `helpers/`: Utility functions for the backend.
- `middleware/`: Custom middleware for request processing.
- `models/`: Data models/schemas for the application.
- `routes/`: API route definitions.
- `utils/`: Additional utility scripts.
- `server.js`: Main entry point for the backend server.
- `package.json`: Backend dependencies and scripts.

### frontend/
- `src/`: Source code for the frontend application.
- `public/`: Static assets like images and icons.
- `index.html`: Main HTML file.
- `vite.config.js`: Configuration for Vite (build tool).
- `package.json`: Frontend dependencies and scripts.
- `eslint.config.js`: Linting configuration.

## Prerequisites

- **Node.js**: v16.x or higher
- **npm**: v8.x or higher
- **A blockchain network**: Configured in `blockchain.config.js` (e.g., Ethereum, Polygon, or a testnet like Sepolia).
- **Web3 provider**: Such as MetaMask or an RPC endpoint.

## Installation

### Clone the repository:
```bash
git clone https://github.com/your-username/edutrust.git
cd edutrust
```

### Install dependencies for the backend:
```bash
cd credential-dapp-backend
npm install
```

### Install dependencies for the frontend:
```bash
cd ../frontend
npm install
```

## Running the Application

### Backend
Navigate to the backend directory:
```bash
cd credential-dapp-backend
```

Configure the blockchain settings in `blockchain.config.js` (e.g., network URL, private keys, etc.).

Start the backend server:
```bash
npm start
```

The server will run on [http://localhost:3000](http://localhost:3000) (or the port specified in `server.js`).

### Frontend
Navigate to the frontend directory:
```bash
cd frontend
```

Start the development server:
```bash
npm run dev
```

The frontend will be available at [http://localhost:5173](http://localhost:5173) (default Vite port).

## Backend

The backend is a Node.js application responsible for:
- Interacting with the blockchain to mint and manage Credential NFTs.
- Providing RESTful APIs for credential issuance, verification, and user management.
- Handling authentication and request validation via middleware.

**Key files:**
- `server.js`: Entry point for the Express server.
- `routes/`: Defines API endpoints (e.g., `/issue-credential`, `/verify-credential`).
- `CredentialNFT.json`: Smart contract interface for NFT operations.

## Frontend

The frontend is built with modern web technologies (likely React or a similar framework, given Vite) and provides:
- A user interface for students, educators, and institutions.
- Integration with the backend APIs for credential management.
- Wallet connectivity (e.g., MetaMask) for blockchain interactions.

**Key files:**
- `src/`: Contains components, pages, and application logic.
- `vite.config.js`: Configures the Vite build tool for fast development and production builds.

## Contributing

1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add your feature"
   ```
4. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a pull request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.# Edutrust
