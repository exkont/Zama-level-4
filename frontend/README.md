# Help Platform Frontend

React application for interacting with the FHE-powered fundraising platform.

## 🚀 Quick Start

### Install Dependencies

```bash
cd frontend
npm install
```

### Start Development Server

```bash
npm start
```

The application will open at http://localhost:3000

### Build for Production

```bash
npm run build
```

## 🔧 Configuration

### Update Contract Address

After deploying the FundraisingPlatform contract, update the address in `src/config/contract.ts`:

```typescript
export const ADDRESS = "YOUR_CONTRACT_ADDRESS";
```

### MetaMask Setup

1. Install MetaMask extension in your browser
2. Add Sepolia Testnet network
3. Get test ETH: https://sepoliafaucet.com/

## 📱 Features

- ✅ Home page with project description
- ✅ List of active campaigns
- ✅ Campaign details and management
- ✅ Create new fundraising campaigns
- ✅ MetaMask wallet integration
- ✅ Encrypted donations using Zama FHE
- ✅ Real-time statistics from blockchain
- ✅ Campaign creator controls (close campaigns)
- ✅ Smart donation restrictions

## 🏗️ Architecture

```
src/
├── components/
│   └── Navbar.tsx           # Navigation and wallet connection
├── pages/
│   ├── HomePage.tsx         # Landing page with real-time stats
│   ├── CampaignsPage.tsx    # Campaign listing with filters
│   ├── CreateCampaignPage.tsx # Campaign creation form
│   ├── CampaignDetailsPage.tsx # Campaign details and donations
│   └── AboutPage.tsx        # About us page
├── hooks/
│   ├── useWallet.tsx        # MetaMask integration
│   └── useContract.tsx      # Smart contract interaction
├── config/
│   └── contract.ts          # Contract configuration
└── App.tsx                  # Main application component
```

## 🎨 UI/UX Features

- **Modern Design**: Material-UI components with gradients and animations
- **Responsive Layout**: Works seamlessly on desktop and mobile
- **Real-time Data**: Live statistics from blockchain
- **Intuitive Navigation**: Easy-to-use interface
- **Loading States**: Smooth user experience during data loading
- **Error Handling**: User-friendly error messages

## 🔐 Security Features

- **Wallet Security**: Private keys remain in MetaMask
- **FHE Encryption**: Anonymous donations using Zama FHE technology
- **Input Validation**: Comprehensive form validation
- **Safe Wallet Integration**: Secure MetaMask connection
- **Access Control**: Only campaign creators can close their campaigns

## 📊 Real-time Statistics

The homepage displays live data from the blockchain:

- **Total Campaigns**: Actual number of created campaigns
- **Active Campaigns**: Currently active campaigns (not closed, not expired)
- **Total Raised**: Sum of all collected funds in ETH
- **Success Rate**: Percentage of campaigns that reached their target

## 🛠️ Development

### Available Scripts

```bash
# Start development server
npm start

# Build for production
npm run build

# Run tests
npm test

# Eject from Create React App
npm run eject
```

### Environment Variables

Create a `.env` file in the frontend directory if needed:

```env
REACT_APP_CONTRACT_ADDRESS=your_contract_address
REACT_APP_RPC_URL=your_rpc_url
```

## 🔗 Integration

### Smart Contract Integration

The frontend integrates with the `FundraisingPlatform.sol` contract:

- Campaign creation and management
- Encrypted donation processing
- Real-time progress tracking
- Fund withdrawal functionality

### Network Configuration

Currently configured for:

- **Sepolia Testnet**: Development and testing
- **Alchemy RPC**: Reliable blockchain connection
- **MetaMask**: Wallet integration

## 📝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

---

**Built with React, TypeScript, and Material-UI**
