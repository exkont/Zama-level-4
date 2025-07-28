import React, { useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Stepper,
  Step,
  StepLabel,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useContract } from "../hooks/useContract";
import { useWallet } from "../hooks/useWallet";

const steps = ["Basic Information", "Campaign Details", "Review and Create"];

const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const { createCampaign } = useContract();
  const { account } = useWallet();

  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    targetAmount: "",
    duration: "30",
  });

  const handleNext = () => {
    if (validateStep()) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
      setError(null);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    setError(null);
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.title.trim()) {
          setError("Campaign title is required");
          return false;
        }
        if (formData.title.length < 5) {
          setError("Title must be at least 5 characters long");
          return false;
        }
        break;
      case 1:
        if (!formData.description.trim()) {
          setError("Campaign description is required");
          return false;
        }
        if (formData.description.length < 20) {
          setError("Description must be at least 20 characters long");
          return false;
        }
        if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
          setError("Target amount must be greater than 0");
          return false;
        }
        if (!formData.duration || parseInt(formData.duration) <= 0) {
          setError("Duration must be greater than 0");
          return false;
        }
        break;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!account) {
      setError("Please connect your wallet");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const targetAmountWei = (parseFloat(formData.targetAmount) * 1e18).toString();
      const durationSeconds = parseInt(formData.duration) * 24 * 60 * 60;

      const campaignId = await createCampaign(formData.title, formData.description, targetAmountWei, durationSeconds);

      setSuccess(true);
      setTimeout(() => {
        navigate(`/campaign/${campaignId}`);
      }, 2000);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      setError(error.message || "Error creating campaign");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setError(null);
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Campaign Title
            </Typography>
            <TextField
              fullWidth
              label="Enter campaign title"
              value={formData.title}
              onChange={handleInputChange("title")}
              placeholder="Help John with cancer treatment"
              helperText="Choose a clear and compelling title for your campaign"
              margin="normal"
            />
          </Box>
        );

      case 1:
        return (
          <Box>
            <TextField
              fullWidth
              label="Campaign Description"
              value={formData.description}
              onChange={handleInputChange("description")}
              multiline
              rows={6}
              placeholder="Tell your story in detail. Explain why you need help, what the funds will be used for..."
              helperText="Detailed description helps donors understand your situation"
              margin="normal"
            />

            <Grid container spacing={3} sx={{ mt: 2 }}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Target Amount (ETH)"
                  type="number"
                  value={formData.targetAmount}
                  onChange={handleInputChange("targetAmount")}
                  placeholder="1.5"
                  helperText="Amount needed in ETH"
                  inputProps={{ min: 0, step: 0.001 }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Duration (days)"
                  type="number"
                  value={formData.duration}
                  onChange={handleInputChange("duration")}
                  placeholder="30"
                  helperText="How many days to run the campaign"
                  inputProps={{ min: 1 }}
                />
              </Grid>
            </Grid>
          </Box>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Review Your Campaign
            </Typography>

            <Card sx={{ mt: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>Title:</strong> {formData.title}
                </Typography>
                <Typography variant="body2" paragraph>
                  <strong>Description:</strong> {formData.description}
                </Typography>
                <Typography variant="body2">
                  <strong>Target Amount:</strong> {formData.targetAmount} ETH
                </Typography>
                <Typography variant="body2">
                  <strong>Duration:</strong> {formData.duration} days
                </Typography>
              </CardContent>
            </Card>

            <Alert severity="info" sx={{ mt: 2 }}>
              Once created, you cannot edit the campaign details. Please review carefully.
            </Alert>
          </Box>
        );

      default:
        return null;
    }
  };

  if (success) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, textAlign: "center" }}>
        <Alert severity="success">Campaign created successfully! Redirecting to campaign page...</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom textAlign="center">
        Create New Campaign
      </Typography>

      <Card sx={{ mt: 4 }}>
        <CardContent>
          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {renderStepContent()}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
            <Button disabled={activeStep === 0} onClick={handleBack}>
              Back
            </Button>

            <Box>
              {activeStep === steps.length - 1 ? (
                <Button variant="contained" onClick={handleSubmit} disabled={loading || !account}>
                  {loading ? "Creating..." : "Create Campaign"}
                </Button>
              ) : (
                <Button variant="contained" onClick={handleNext}>
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CreateCampaignPage;
