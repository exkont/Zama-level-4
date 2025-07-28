# Frontend is deployed on https://zama-level-4.vercel.app

# Help Platform - FHE-Powered Fundraising

A decentralized fundraising platform built with **Fully Homomorphic Encryption (FHE)** technology from Zama. This
platform enables secure, anonymous donations while maintaining transparency of overall campaign progress.

## 🚀 Features

### **Privacy-First Donations**

- **Anonymous Donor Identity**: Your donation identity is encrypted using Zama FHE technology
- **Transparent Progress**: Public visibility of campaign progress percentages without revealing individual donors
- **Mathematical Proof**: Complete verification of calculations without exposing private data

### **Campaign Management**

- **Create Campaigns**: Set up fundraising campaigns with target amounts and deadlines
- **Active Campaign Control**: Campaign creators can close campaigns early
- **Smart Restrictions**: Automatic blocking of donations when targets are reached or campaigns are inactive
- **Fund Withdrawal**: Secure withdrawal of collected funds by campaign creators

### **Modern UI/UX**

- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Real-time Statistics**: Live data from blockchain showing actual campaign metrics
- **Intuitive Navigation**: Easy-to-use interface for browsing and creating campaigns

## 🛠 Technology Stack

### **Smart Contract**

- **Solidity 0.8.24**: Core contract logic
- **Zama FHE**: Fully Homomorphic Encryption for privacy
- **OpenZeppelin**: Security contracts (Ownable, ReentrancyGuard)
- **Hardhat**: Development and deployment framework

### **Frontend**

- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Material-UI**: Professional component library
- **Ethers.js**: Ethereum blockchain interaction
- **React Router**: Client-side routing

### **Development Tools**

- **Hardhat Deploy**: Automated deployment management
- **Sepolia Testnet**: Ethereum test network for development
- **Alchemy RPC**: Reliable blockchain connection

## 📋 Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MetaMask** or other Web3 wallet
- **Sepolia ETH** for testing

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd ZAMA_level_3_builder\ 2
npm install
```

### 2. Environment Setup

Create a `.env` file in the root directory:

```env
PRIVATE_KEY=your_private_key_here
ALCHEMY_API_KEY=your_alchemy_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### 3. Deploy Smart Contract

```bash
# Deploy to Sepolia testnet
npx hardhat deploy --network sepolia --reset

# Verify contract on Etherscan (optional)
npx hardhat verify --network sepolia <contract_address>
```

### 4. Update Frontend Configuration

After deployment, update the contract address in `frontend/src/config/contract.ts`:

```typescript
export const ADDRESS = "your_deployed_contract_address";
```

### 5. Start Frontend Development

```bash
cd frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`

## 📚 Main Commands

### **Smart Contract Development**

```bash
# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to local network
npx hardhat deploy --network localhost

# Deploy to Sepolia testnet
npx hardhat deploy --network sepolia --reset

# Verify contract on Etherscan
npx hardhat verify --network sepolia <contract_address>
```

### **Frontend Development**

```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

### **Testing and Scripts**

```bash
# Test deployed contract
npx hardhat run scripts/test-deployed-contract.ts --network sepolia

# Create test campaign
npx hardhat run scripts/create-test-campaign.ts --network sepolia

# Test donation functionality
npx hardhat run scripts/test-donation.ts --network sepolia

# Check campaigns
npx hardhat run scripts/check-campaigns.ts --network sepolia
```

### **Hardhat Tasks**

```bash
# List accounts
npx hardhat accounts

# Check deployer balance
npx hardhat run scripts/check_deployer.ts --network sepolia
```

## 🏗 Project Structure

```
ZAMA_level_3_builder 2/
├── contracts/
│   └── FundraisingPlatform.sol    # Main smart contract
├── deploy/
│   └── deploy-fundraising.ts      # Deployment script
├── frontend/
│   ├── src/
│   │   ├── components/            # React components
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── pages/                 # Page components
│   │   └── config/                # Configuration files
│   └── public/                    # Static assets
├── scripts/                       # Hardhat scripts
├── test/                          # Contract tests
└── tasks/                         # Hardhat tasks
```

## 🔐 Security Features

### **FHE Privacy Protection**

- **Encrypted Donor Identity**: Individual donor information is never revealed
- **Homomorphic Operations**: Mathematical operations performed on encrypted data
- **Zero-Knowledge Proofs**: Verification without revealing private information

### **Smart Contract Security**

- **Reentrancy Protection**: Prevents reentrancy attacks
- **Access Control**: Only campaign creators can close their campaigns
- **Input Validation**: Comprehensive parameter validation
- **Safe Math**: Built-in overflow protection

## 🌐 Network Configuration

### **Supported Networks**

- **Localhost**: Development and testing
- **Sepolia**: Ethereum testnet (recommended for testing)
- **Mainnet**: Production deployment (requires proper setup)

### **RPC Endpoints**

- **Alchemy**: Primary RPC provider for reliable connections
- **Infura**: Alternative RPC provider
- **Local**: Hardhat network for development

## 📊 Contract Functions

### **Campaign Management**

- `createCampaign()`: Create new fundraising campaign
- `endCampaign()`: Close campaign (creator only)
- `withdrawFunds()`: Withdraw collected funds (creator only)

### **Donation System**

- `donate()`: Make encrypted donation
- `requestRefund()`: Request refund for failed campaigns

### **Query Functions**

- `getAllCampaigns()`: Get all campaign IDs
- `getActiveCampaigns()`: Get active campaign IDs
- `getCampaignBasicInfo()`: Get campaign details
- `getProgressPercentage()`: Get campaign progress

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama**: For FHE technology and support
- **OpenZeppelin**: For secure smart contract libraries
- **Hardhat**: For excellent development framework
- **Material-UI**: For beautiful React components

## 📞 Support

For questions or support, please open an issue in the GitHub repository.

---

**Built with ❤️ using Zama FHE technology**
