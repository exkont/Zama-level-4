import React from "react";
import { Container, Typography, Box, Card, CardContent, Grid, Button, Chip, Avatar } from "@mui/material";
import { Security, Public, Favorite, Code, AccountBalance, Lock, TrendingUp, Group } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Security sx={{ fontSize: 40 }} />,
      title: "Privacy-First",
      description: "Complete anonymity for donors using Zama FHE technology",
      color: "#1976d2",
    },
    {
      icon: <Public sx={{ fontSize: 40 }} />,
      title: "Transparent Progress",
      description: "Real-time campaign progress without revealing individual donations",
      color: "#2e7d32",
    },
    {
      icon: <Favorite sx={{ fontSize: 40 }} />,
      title: "Direct Impact",
      description: "100% of funds go directly to those in need",
      color: "#d32f2f",
    },
    {
      icon: <AccountBalance sx={{ fontSize: 40 }} />,
      title: "Decentralized",
      description: "Built on Ethereum with smart contract transparency",
      color: "#ed6c02",
    },
  ];

  const techStack = [
    { name: "React", color: "#61dafb" },
    { name: "TypeScript", color: "#3178c6" },
    { name: "Material-UI", color: "#0081cb" },
    { name: "Solidity", color: "#363636" },
    { name: "FHE", color: "#ff6b35" },
    { name: "Ethereum", color: "#627eea" },
  ];

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 8 }}>
      {/* Hero Section */}
      <Box textAlign="center" mb={8}>
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            background: "linear-gradient(45deg, #1976d2, #42a5f5)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            fontWeight: "bold",
            mb: 3,
          }}
        >
          About Help Platform
        </Typography>
        <Typography variant="h5" color="text.secondary" paragraph sx={{ maxWidth: 800, mx: "auto" }}>
          Revolutionizing charitable giving with blockchain technology and zero-knowledge privacy
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" size="large" onClick={() => navigate("/campaigns")} sx={{ mr: 2, mb: 2 }}>
            Explore Campaigns
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate("/create")} sx={{ mb: 2 }}>
            Start Campaign
          </Button>
        </Box>
      </Box>

      {/* Mission Section */}
      <Card sx={{ mb: 8, background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
        <CardContent sx={{ p: 6 }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
            Our Mission
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: "1.1rem", lineHeight: 1.8 }}>
            We believe that helping others should be accessible, transparent, and private. Our platform combines the
            power of blockchain technology with cutting-edge Fully Homomorphic Encryption (FHE) to create a donation
            system that protects donor privacy while ensuring complete transparency of campaign progress.
          </Typography>
          <Typography variant="body1" sx={{ fontSize: "1.1rem", lineHeight: 1.8 }}>
            Whether you're seeking support for medical treatment or want to help someone in need, our platform provides
            a secure, anonymous, and efficient way to make a difference.
          </Typography>
        </CardContent>
      </Card>

      {/* Features Grid */}
      <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
        Why Choose Help Platform?
      </Typography>
      <Grid container spacing={4} sx={{ mb: 8 }}>
        {features.map((feature, index) => (
          <Grid item xs={12} md={6} key={index}>
            <Card
              sx={{
                height: "100%",
                transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                },
              }}
            >
              <CardContent sx={{ p: 4, textAlign: "center" }}>
                <Box sx={{ color: feature.color, mb: 2 }}>{feature.icon}</Box>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Technology Section */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
          Technology Stack
        </Typography>
        <Card sx={{ p: 4 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Frontend
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
                {techStack.slice(0, 3).map((tech) => (
                  <Chip
                    key={tech.name}
                    label={tech.name}
                    sx={{
                      backgroundColor: tech.color,
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                ))}
              </Box>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                Blockchain & Privacy
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {techStack.slice(3).map((tech) => (
                  <Chip
                    key={tech.name}
                    label={tech.name}
                    sx={{
                      backgroundColor: tech.color,
                      color: "white",
                      fontWeight: "bold",
                    }}
                  />
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: "center" }}>
                <Code sx={{ fontSize: 120, color: "primary.main", mb: 2 }} />
                <Typography variant="h6" color="primary" sx={{ fontWeight: "bold" }}>
                  Open Source
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Built with transparency and community in mind
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* How It Works */}
      <Box sx={{ mb: 8 }}>
        <Typography variant="h4" gutterBottom sx={{ mb: 4, fontWeight: "bold" }}>
          How It Works
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", textAlign: "center" }}>
              <CardContent sx={{ p: 4 }}>
                <Avatar sx={{ bgcolor: "primary.main", width: 80, height: 80, mx: "auto", mb: 2 }}>
                  <Group sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  1. Create Campaign
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Set up a fundraising campaign with your story and target amount
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", textAlign: "center" }}>
              <CardContent sx={{ p: 4 }}>
                <Avatar sx={{ bgcolor: "secondary.main", width: 80, height: 80, mx: "auto", mb: 2 }}>
                  <Lock sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  2. Anonymous Donations
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Donors contribute anonymously using FHE encryption
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: "100%", textAlign: "center" }}>
              <CardContent sx={{ p: 4 }}>
                <Avatar sx={{ bgcolor: "success.main", width: 80, height: 80, mx: "auto", mb: 2 }}>
                  <TrendingUp sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: "bold" }}>
                  3. Transparent Progress
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Track progress publicly while maintaining donor privacy
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* CTA Section */}
      <Card sx={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "white" }}>
        <CardContent sx={{ p: 6, textAlign: "center" }}>
          <Typography variant="h4" gutterBottom sx={{ fontWeight: "bold", mb: 3 }}>
            Ready to Make a Difference?
          </Typography>
          <Typography variant="body1" paragraph sx={{ fontSize: "1.1rem", mb: 4 }}>
            Join our community of donors and campaign creators. Every contribution matters.
          </Typography>
          <Box>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate("/campaigns")}
              sx={{ mr: 2, mb: 2, backgroundColor: "white", color: "primary.main" }}
            >
              Browse Campaigns
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate("/create")}
              sx={{ mb: 2, borderColor: "white", color: "white" }}
            >
              Start Your Campaign
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AboutPage;
