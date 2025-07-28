import React from "react";
import { AppBar, Toolbar, Typography, Button, Box, Menu, MenuItem } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../hooks/useWallet";

const Navbar: React.FC = () => {
  const { account, connectWallet, disconnectWallet, isConnecting } = useWallet();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const location = useLocation();

  const isActivePage = (path: string) => {
    return location.pathname === path;
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleAccountClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleDisconnect = () => {
    disconnectWallet();
    handleCloseMenu();
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          <Link to="/" style={{ textDecoration: "none", color: "inherit" }}>
            Help Platform
          </Link>
        </Typography>

        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <Button
            color="inherit"
            component={Link}
            to="/"
            sx={{
              fontWeight: isActivePage("/") ? "bold" : "normal",
              textDecoration: isActivePage("/") ? "underline" : "none",
            }}
          >
            Home
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/campaigns"
            sx={{
              fontWeight: isActivePage("/campaigns") ? "bold" : "normal",
              textDecoration: isActivePage("/campaigns") ? "underline" : "none",
            }}
          >
            Campaigns
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/create"
            sx={{
              fontWeight: isActivePage("/create") ? "bold" : "normal",
              textDecoration: isActivePage("/create") ? "underline" : "none",
            }}
          >
            Create
          </Button>

          <Button
            color="inherit"
            component={Link}
            to="/about"
            sx={{
              fontWeight: isActivePage("/about") ? "bold" : "normal",
              textDecoration: isActivePage("/about") ? "underline" : "none",
            }}
          >
            About
          </Button>

          {account ? (
            <>
              <Button variant="outlined" color="inherit" sx={{ ml: 2 }} onClick={handleAccountClick}>
                {formatAddress(account)}
              </Button>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleCloseMenu}
                anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "right",
                }}
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
              >
                <MenuItem onClick={handleDisconnect}>Disconnect Wallet</MenuItem>
              </Menu>
            </>
          ) : (
            <Button
              variant="contained"
              color="secondary"
              onClick={connectWallet}
              disabled={isConnecting}
              sx={{ ml: 2 }}
            >
              {isConnecting ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
