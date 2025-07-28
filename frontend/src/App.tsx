import React from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./pages/HomePage";
import CampaignsPage from "./pages/CampaignsPage";
import CreateCampaignPage from "./pages/CreateCampaignPage";
import CampaignDetailsPage from "./pages/CampaignDetailsPage";
import AboutPage from "./pages/AboutPage";
import { WalletProvider } from "./hooks/useWallet";

function App() {
  return (
    <WalletProvider>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/campaigns" element={<CampaignsPage />} />
          <Route path="/create" element={<CreateCampaignPage />} />
          <Route path="/campaign/:id" element={<CampaignDetailsPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </div>
    </WalletProvider>
  );
}

export default App;
