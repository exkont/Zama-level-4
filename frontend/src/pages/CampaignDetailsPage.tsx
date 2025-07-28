import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Card,
  CardContent,
  LinearProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
} from "@mui/material";
import { useParams, useNavigate } from "react-router-dom";
import { useContract } from "../hooks/useContract";
import { useWallet } from "../hooks/useWallet";

interface CampaignDetails {
  creator: string;
  title: string;
  description: string;
  targetAmount: string;
  deadline: string;
  active: boolean;
  currentAmount: string;
}

const CampaignDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { account } = useWallet();
  const { getCampaignBasicInfo, donate, getAllCampaigns, closeCampaign } = useContract();

  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [closing, setClosing] = useState(false);
  const [donationAmount, setDonationAmount] = useState("");
  const [showDonateDialog, setShowDonateDialog] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadCampaign = useCallback(async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError(null);

      const campaignId = parseInt(id);

      // Check if campaign ID is valid
      if (campaignId < 0 || isNaN(campaignId)) {
        setError("Invalid campaign ID. Campaign IDs must be non-negative numbers.");
        return;
      }

      // Check if campaign exists by getting all campaigns first
      const allCampaigns = await getAllCampaigns();
      if (!allCampaigns.includes(campaignId)) {
        setError(`Campaign ${campaignId} does not exist. Available campaigns: ${allCampaigns.join(", ")}`);
        return;
      }

      const basicInfo = await getCampaignBasicInfo(campaignId);

      setCampaign({
        creator: basicInfo.creator,
        title: basicInfo.title,
        description: basicInfo.description,
        targetAmount: basicInfo.targetAmount,
        deadline: basicInfo.deadline,
        active: basicInfo.active,
        currentAmount: basicInfo.currentAmount,
      });
    } catch (error: any) {
      console.error("Error loading campaign:", error);
      setError(`Failed to load campaign details: ${error.message}`);
    } finally {
      setLoading(false);
    }
  }, [id, getCampaignBasicInfo, getAllCampaigns]);

  useEffect(() => {
    loadCampaign();
  }, [loadCampaign]);

  const handleDonate = async () => {
    if (!account || !campaign || !donationAmount) {
      setError("Please connect wallet and enter donation amount");
      return;
    }

    if (parseFloat(donationAmount) <= 0) {
      setError("Donation amount must be greater than 0");
      return;
    }

    if (parseFloat(donationAmount) < 0.001) {
      setError("Minimum donation amount is 0.001 ETH to cover gas costs");
      return;
    }

    try {
      setDonating(true);
      setError(null);

      const campaignId = parseInt(id!);
      const amountWei = (parseFloat(donationAmount) * 1e18).toString();

      await donate(campaignId, amountWei);

      setSuccess("Donation successful! Thank you for your support.");
      setShowDonateDialog(false);
      setDonationAmount("");

      setTimeout(() => {
        loadCampaign();
      }, 2000);
    } catch (error: any) {
      console.error("Error making donation:", error);
      setError(error.message || "Failed to process donation");
    } finally {
      setDonating(false);
    }
  };

  const handleCloseCampaign = async () => {
    if (!campaign || !account) {
      setError("Please connect wallet");
      return;
    }

    if (account.toLowerCase() !== campaign.creator.toLowerCase()) {
      setError("Only campaign creator can close the campaign");
      return;
    }

    try {
      setClosing(true);
      setError(null);
      await closeCampaign(parseInt(id!));
      setSuccess("Campaign closed successfully!");
      await loadCampaign(); // Reload campaign data
    } catch (error: any) {
      console.error("Error closing campaign:", error);
      setError(`Failed to close campaign: ${error.message}`);
    } finally {
      setClosing(false);
    }
  };

  const formatAmount = (amount: string) => {
    const eth = parseFloat(amount) / 1e18;
    return eth.toFixed(10);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const getProgress = () => {
    if (!campaign) return 0;
    const currentEth = parseFloat(campaign.currentAmount) / 1e18;
    const targetEth = parseFloat(campaign.targetAmount) / 1e18;
    return targetEth > 0 ? Math.min((currentEth / targetEth) * 100, 100) : 0;
  };

  const isExpired = () => {
    if (!campaign) return false;
    return Date.now() > parseInt(campaign.deadline) * 1000;
  };

  const canDonate = () => {
    if (!campaign || !account) return false;

    // Check if campaign is active and not expired
    if (!campaign.active || isExpired()) return false;

    // Check if target amount is reached
    const currentAmount = parseFloat(campaign.currentAmount);
    const targetAmount = parseFloat(campaign.targetAmount);
    if (currentAmount >= targetAmount) return false;

    return true;
  };

  const isTargetReached = () => {
    if (!campaign) return false;
    const currentAmount = parseFloat(campaign.currentAmount);
    const targetAmount = parseFloat(campaign.targetAmount);
    return currentAmount >= targetAmount;
  };

  const canCloseCampaign = () => {
    if (!campaign || !account) return false;

    // Only creator can close campaign
    if (account.toLowerCase() !== campaign.creator.toLowerCase()) return false;

    // Campaign must be active and not expired
    if (!campaign.active || isExpired()) return false;

    // Cannot close if target is already reached
    if (isTargetReached()) return false;

    return true;
  };

  const getCampaignStatus = () => {
    if (!campaign) return "Unknown";

    if (!campaign.active) return "Ended";
    if (isExpired()) return "Expired";
    if (isTargetReached()) return "Target Reached";
    return "Active";
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography>Loading campaign details...</Typography>
      </Container>
    );
  }

  if (!campaign) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Alert severity="error">Campaign not found</Alert>
        <Button onClick={() => navigate("/campaigns")} sx={{ mt: 2 }}>
          Back to Campaigns
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Button onClick={() => navigate("/campaigns")} sx={{ mb: 2 }}>
        ← Back to Campaigns
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      <Card>
        <CardContent>
          <Typography variant="h4" component="h1" gutterBottom>
            {campaign.title}
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Typography variant="body1" paragraph>
                {campaign.description}
              </Typography>

              <Box mt={3}>
                <Typography variant="h6" gutterBottom>
                  Campaign Details
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Creator:</strong> {campaign.creator}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Target Amount:</strong> {formatAmount(campaign.targetAmount)} ETH
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Deadline:</strong> {formatDate(campaign.deadline)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Status:</strong> {getCampaignStatus()}
                </Typography>
              </Box>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Fundraising Progress
                  </Typography>

                  <Box mb={2}>
                    <Typography variant="h4" color="primary">
                      {getProgress().toFixed(1)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      of target reached
                    </Typography>
                  </Box>

                  <LinearProgress
                    variant="determinate"
                    value={getProgress()}
                    sx={{ height: 10, borderRadius: 5, mb: 2 }}
                  />

                  <Typography variant="body2" color="text.secondary">
                    Raised: {formatAmount(campaign.currentAmount)} ETH
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Target: {formatAmount(campaign.targetAmount)} ETH
                  </Typography>

                  {canDonate() && (
                    <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={() => setShowDonateDialog(true)}>
                      Donate Now
                    </Button>
                  )}

                  {!canDonate() && campaign.active && !isExpired() && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      {isTargetReached() ? "Target amount reached" : "Campaign is not active"}
                    </Alert>
                  )}

                  {canCloseCampaign() && (
                    <Button
                      variant="outlined"
                      color="warning"
                      fullWidth
                      sx={{ mt: 2 }}
                      onClick={handleCloseCampaign}
                      disabled={closing}
                    >
                      {closing ? "Closing..." : "Close Campaign"}
                    </Button>
                  )}

                  {!account && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Connect your wallet to donate
                    </Alert>
                  )}

                  {isExpired() && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      This campaign has expired
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Dialog open={showDonateDialog} onClose={() => setShowDonateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Make a Donation</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" paragraph>
            Your donation target will be encrypted and kept private. Nobody can see who you donated to.
          </Typography>

          <TextField
            fullWidth
            label="Donation Amount (ETH)"
            type="number"
            value={donationAmount}
            onChange={(e) => setDonationAmount(e.target.value)}
            placeholder="0.1"
            helperText="Minimum donation: 0.001 ETH (required for gas costs)"
            sx={{ mt: 2 }}
            inputProps={{ min: 0.001, step: 0.001 }}
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDonateDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleDonate} disabled={donating || !donationAmount}>
            {donating ? "Processing..." : "Donate"}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CampaignDetailsPage;
