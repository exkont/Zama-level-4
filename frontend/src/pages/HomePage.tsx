import React, { useState, useEffect } from "react";
import { Container, Typography, Box, Grid, Card, Button, Avatar } from "@mui/material";
import { Security, Public, Favorite, TrendingUp, Group, Lock, Verified, Speed } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { useContract } from "../hooks/useContract";

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { getAllCampaigns, getCampaignBasicInfo } = useContract();
  const [stats, setStats] = useState({
    totalCampaigns: 0,
    activeCampaigns: 0,
    totalRaised: "0",
    successRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const campaignIds = await getAllCampaigns();

        let totalRaised = 0;
        let activeCount = 0;
        let successfulCount = 0;

        for (const id of campaignIds) {
          const campaign = await getCampaignBasicInfo(id);
          const currentAmount = parseFloat(campaign.currentAmount) / 1e18;
          const targetAmount = parseFloat(campaign.targetAmount) / 1e18;

          totalRaised += currentAmount;

          // Check if campaign is active (not ended and not expired)
          const now = Date.now();
          const deadline = parseInt(campaign.deadline) * 1000;
          if (campaign.active && now <= deadline) {
            activeCount++;
          }

          // Check if campaign reached target
          if (currentAmount >= targetAmount) {
            successfulCount++;
          }
        }

        const successRate = campaignIds.length > 0 ? (successfulCount / campaignIds.length) * 100 : 0;

        setStats({
          totalCampaigns: campaignIds.length,
          activeCampaigns: activeCount,
          totalRaised: totalRaised.toFixed(2),
          successRate: Math.round(successRate),
        });
      } catch (error) {
        console.error("Error loading stats:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [getAllCampaigns, getCampaignBasicInfo]);

  const features = [
    {
      icon: <Security sx={{ fontSize: 50 }} />,
      title: "Complete Privacy",
      description: "Donation targets are encrypted using Zama FHE technology. Nobody can see who you donated to.",
      color: "#1976d2",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    },
    {
      icon: <Public sx={{ fontSize: 50 }} />,
      title: "Transparent Progress",
      description:
        "You can publicly see the percentage of the target amount raised without revealing specific donation amounts.",
      color: "#2e7d32",
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
    },
    {
      icon: <Favorite sx={{ fontSize: 50 }} />,
      title: "Direct Impact",
      description: "All funds go directly to people who need treatment and medical support. No platform fees.",
      color: "#d32f2f",
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)",
    },
  ];

  const statsData = [
    {
      label: "Total Campaigns",
      value: loading ? "..." : stats.totalCampaigns.toString(),
      icon: <TrendingUp />,
    },
    {
      label: "Active Campaigns",
      value: loading ? "..." : stats.activeCampaigns.toString(),
      icon: <Verified />,
    },
    {
      label: "Total Raised",
      value: loading ? "..." : `${stats.totalRaised} ETH`,
      icon: <Group />,
    },
    {
      label: "Success Rate",
      value: loading ? "..." : `${stats.successRate}%`,
      icon: <Speed />,
    },
  ];

  return (
    <Box sx={{ minHeight: "100vh" }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 12,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              'url(\'data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\')',
            opacity: 0.3,
          }}
        />
        <Container maxWidth="lg" sx={{ position: "relative", zIndex: 1 }}>
          <Box textAlign="center">
            <Typography
              variant="h1"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: "bold",
                fontSize: { xs: "2.5rem", md: "4rem" },
                mb: 3,
                textShadow: "0 2px 4px rgba(0,0,0,0.3)",
              }}
            >
              Help Platform
            </Typography>
            <Typography
              variant="h4"
              component="h2"
              sx={{
                mb: 4,
                fontWeight: 300,
                maxWidth: 800,
                mx: "auto",
                textShadow: "0 1px 2px rgba(0,0,0,0.3)",
              }}
            >
              Secure anonymous donations using Zama FHE technology
            </Typography>
            <Typography
              variant="body1"
              paragraph
              sx={{
                fontSize: "1.2rem",
                maxWidth: 700,
                mx: "auto",
                mb: 6,
                opacity: 0.9,
              }}
            >
              Our platform helps people collect funds for treatment and medical support. We use Fully Homomorphic
              Encryption (FHE) technology from Zama to ensure complete privacy of donor identity while maintaining
              transparency of overall progress.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/campaigns")}
                sx={{
                  backgroundColor: "white",
                  color: "primary.main",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Explore Campaigns
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/create")}
                sx={{
                  borderColor: "white",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "white",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Create Campaign
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {statsData.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card
                sx={{
                  textAlign: "center",
                  p: 3,
                  transition: "transform 0.3s ease-in-out",
                  "&:hover": {
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Avatar
                  sx={{
                    bgcolor: "primary.main",
                    width: 60,
                    height: 60,
                    mx: "auto",
                    mb: 2,
                  }}
                >
                  {stat.icon}
                </Avatar>
                <Typography variant="h4" sx={{ fontWeight: "bold", mb: 1 }}>
                  {stat.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: "#f8f9fa" }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: "bold", mb: 6 }}>
            Why Choose Help Platform?
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card
                  sx={{
                    height: "100%",
                    textAlign: "center",
                    p: 4,
                    transition: "all 0.3s ease-in-out",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                    },
                  }}
                >
                  <Box
                    sx={{
                      background: feature.gradient,
                      borderRadius: "50%",
                      width: 100,
                      height: 100,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      mx: "auto",
                      mb: 3,
                      color: "white",
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", mb: 2 }}>
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* How It Works Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" textAlign="center" gutterBottom sx={{ fontWeight: "bold", mb: 6 }}>
          How Zama FHE Technology Works
        </Typography>
        <Typography
          variant="body1"
          paragraph
          textAlign="center"
          sx={{ fontSize: "1.1rem", maxWidth: 800, mx: "auto", mb: 6 }}
        >
          Fully Homomorphic Encryption (FHE) allows computations to be performed on encrypted data without decrypting
          it. This means:
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%", textAlign: "center", p: 4 }}>
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 3,
                }}
              >
                <Lock sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Encrypted Identity
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your donation identity is encrypted on your device before sending
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%", textAlign: "center", p: 4 }}>
              <Avatar
                sx={{
                  bgcolor: "secondary.main",
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 3,
                }}
              >
                <Security sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Smart Contract Processing
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The smart contract can add encrypted donations without seeing individual donors
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%", textAlign: "center", p: 4 }}>
              <Avatar
                sx={{
                  bgcolor: "success.main",
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 3,
                }}
              >
                <Public sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Public Progress
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Only the percentage progress is revealed publicly, not individual donors
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card sx={{ height: "100%", textAlign: "center", p: 4 }}>
              <Avatar
                sx={{
                  bgcolor: "warning.main",
                  width: 80,
                  height: 80,
                  mx: "auto",
                  mb: 3,
                }}
              >
                <Verified sx={{ fontSize: 40 }} />
              </Avatar>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Mathematical Proof
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Complete mathematical proof of calculations without revealing private data
              </Typography>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          py: 8,
        }}
      >
        <Container maxWidth="lg">
          <Box textAlign="center">
            <Typography variant="h3" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
              Ready to Make a Difference?
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: "1.2rem", mb: 4, maxWidth: 600, mx: "auto" }}>
              Join our community of donors and campaign creators. Every contribution matters.
            </Typography>
            <Box sx={{ display: "flex", justifyContent: "center", gap: 2, flexWrap: "wrap" }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => navigate("/campaigns")}
                sx={{
                  backgroundColor: "white",
                  color: "primary.main",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.9)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Browse Campaigns
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={() => navigate("/create")}
                sx={{
                  borderColor: "white",
                  color: "white",
                  px: 4,
                  py: 1.5,
                  fontSize: "1.1rem",
                  fontWeight: "bold",
                  "&:hover": {
                    backgroundColor: "rgba(255,255,255,0.1)",
                    borderColor: "white",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s ease",
                }}
              >
                Start Your Campaign
              </Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default HomePage;
