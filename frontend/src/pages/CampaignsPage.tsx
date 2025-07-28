import React, { useState, useEffect, useCallback } from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  LinearProgress,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Chip,
  Avatar,
  Skeleton,
} from "@mui/material";
import { TrendingUp, Schedule, Person, AttachMoney, FilterList, Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useContract } from "../hooks/useContract";

interface Campaign {
  id: number;
  creator: string;
  title: string;
  description: string;
  targetAmount: string;
  deadline: string;
  active: boolean;
  currentAmount: string;
}

const CampaignsPage: React.FC = () => {
  const navigate = useNavigate();
  const { getAllCampaigns, getCampaignBasicInfo } = useContract();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filter, setFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  const loadCampaigns = useCallback(async () => {
    try {
      setLoading(true);
      const campaignIds = await getAllCampaigns();

      const campaignsData = await Promise.all(
        campaignIds.map(async (id: number) => {
          const basicInfo = await getCampaignBasicInfo(id);
          return {
            id,
            creator: basicInfo.creator,
            title: basicInfo.title,
            description: basicInfo.description,
            targetAmount: basicInfo.targetAmount,
            deadline: basicInfo.deadline,
            active: basicInfo.active,
            currentAmount: basicInfo.currentAmount,
          };
        }),
      );

      // Filter campaigns based on selection
      let filteredCampaigns = campaignsData;

      if (filter === "active") {
        filteredCampaigns = campaignsData.filter((campaign) => {
          // Campaign must be active
          if (!campaign.active) return false;

          // Campaign must not be expired
          const now = Date.now();
          const deadline = parseInt(campaign.deadline) * 1000;
          if (now > deadline) return false;

          // Campaign must not have reached target
          const currentAmount = parseFloat(campaign.currentAmount);
          const targetAmount = parseFloat(campaign.targetAmount);
          if (currentAmount >= targetAmount) return false;

          return true;
        });
      }

      setCampaigns(filteredCampaigns);
    } catch (error) {
      console.error("Error loading campaigns:", error);
    } finally {
      setLoading(false);
    }
  }, [filter, getAllCampaigns, getCampaignBasicInfo]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilter(event.target.value);
  };

  const formatAmount = (amount: string) => {
    const eth = parseFloat(amount) / 1e18;
    return eth.toFixed(4);
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(parseInt(timestamp) * 1000);
    return date.toLocaleDateString();
  };

  const getProgress = (current: string, target: string) => {
    const currentEth = parseFloat(current) / 1e18;
    const targetEth = parseFloat(target) / 1e18;
    return targetEth > 0 ? Math.min((currentEth / targetEth) * 100, 100) : 0;
  };

  const getCampaignStatus = (campaign: Campaign) => {
    if (!campaign.active) return "Ended";

    const now = Date.now();
    const deadline = parseInt(campaign.deadline) * 1000;
    if (now > deadline) return "Expired";

    const currentAmount = parseFloat(campaign.currentAmount);
    const targetAmount = parseFloat(campaign.targetAmount);
    if (currentAmount >= targetAmount) return "Target Reached";

    return "Active";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "success";
      case "Target Reached":
        return "warning";
      case "Expired":
        return "error";
      case "Ended":
        return "default";
      default:
        return "default";
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
        <Box sx={{ mb: 4 }}>
          <Skeleton variant="text" width={300} height={60} />
          <Skeleton variant="text" width={200} height={40} />
        </Box>
        <Grid container spacing={3}>
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <Grid item xs={12} md={6} lg={4} key={item}>
              <Card sx={{ height: 300 }}>
                <CardContent>
                  <Skeleton variant="text" height={40} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="text" height={20} />
                  <Skeleton variant="rectangular" height={20} sx={{ mt: 2 }} />
                  <Skeleton variant="rectangular" height={40} sx={{ mt: 2 }} />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Header Section */}
      <Box sx={{ mb: 6 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: "bold" }}>
              Fundraising Campaigns
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Discover and support campaigns that need your help
            </Typography>
          </Box>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/create")}
            startIcon={<Add />}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
              },
              transition: "all 0.3s ease",
            }}
          >
            Create Campaign
          </Button>
        </Box>

        {/* Filter Section */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <FilterList color="action" />
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Filter Campaigns</InputLabel>
            <Select value={filter} label="Filter Campaigns" onChange={handleFilterChange}>
              <MenuItem value="all">All Campaigns</MenuItem>
              <MenuItem value="active">Active Only</MenuItem>
            </Select>
          </FormControl>
          <Typography variant="body2" color="text.secondary">
            {campaigns.length} campaign{campaigns.length !== 1 ? "s" : ""} found
          </Typography>
        </Box>
      </Box>

      {/* Campaigns Grid */}
      {campaigns.length === 0 ? (
        <Box textAlign="center" mt={8}>
          <Avatar
            sx={{
              bgcolor: "primary.main",
              width: 120,
              height: 120,
              mx: "auto",
              mb: 3,
            }}
          >
            <TrendingUp sx={{ fontSize: 60 }} />
          </Avatar>
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold" }}>
            No campaigns found
          </Typography>
          <Typography variant="body1" color="text.secondary" mb={4} sx={{ maxWidth: 500, mx: "auto" }}>
            {filter === "active"
              ? "No active campaigns available at the moment. Check back later or create the first campaign!"
              : "Be the first to create a fundraising campaign and start making a difference."}
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={() => navigate("/create")}
            startIcon={<Add />}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              px: 4,
              py: 1.5,
              fontSize: "1.1rem",
              fontWeight: "bold",
            }}
          >
            Create First Campaign
          </Button>
        </Box>
      ) : (
        <Grid container spacing={4}>
          {campaigns.map((campaign) => (
            <Grid item xs={12} md={6} lg={4} key={campaign.id}>
              <Card
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  transition: "all 0.3s ease-in-out",
                  cursor: "pointer",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                  },
                }}
                onClick={() => navigate(`/campaign/${campaign.id}`)}
              >
                <CardContent sx={{ flexGrow: 1, p: 3 }}>
                  {/* Header */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold", lineHeight: 1.3 }}>
                      {campaign.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.4,
                      }}
                    >
                      {campaign.description}
                    </Typography>
                  </Box>

                  {/* Status Chip */}
                  <Box sx={{ mb: 3 }}>
                    <Chip
                      label={getCampaignStatus(campaign)}
                      color={getStatusColor(getCampaignStatus(campaign))}
                      size="small"
                      sx={{ fontWeight: "bold" }}
                    />
                  </Box>

                  {/* Progress Section */}
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                        {getProgress(campaign.currentAmount, campaign.targetAmount).toFixed(1)}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={getProgress(campaign.currentAmount, campaign.targetAmount)}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: "rgba(0,0,0,0.1)",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 4,
                          background: "linear-gradient(90deg, #667eea 0%, #764ba2 100%)",
                        },
                      }}
                    />
                  </Box>

                  {/* Campaign Details */}
                  <Box sx={{ mb: 3 }}>
                    <Box display="flex" alignItems="center" mb={1}>
                      <AttachMoney sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Raised: {formatAmount(campaign.currentAmount)} ETH
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <TrendingUp sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Target: {formatAmount(campaign.targetAmount)} ETH
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Schedule sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Deadline: {formatDate(campaign.deadline)}
                      </Typography>
                    </Box>
                    <Box display="flex" alignItems="center">
                      <Person sx={{ fontSize: 16, color: "text.secondary", mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        Creator: {campaign.creator.slice(0, 6)}...{campaign.creator.slice(-4)}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Action Button */}
                  <Button
                    variant="contained"
                    fullWidth
                    sx={{
                      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      fontWeight: "bold",
                      py: 1.5,
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 8px 16px rgba(0,0,0,0.2)",
                      },
                      transition: "all 0.3s ease",
                    }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CampaignsPage;
