import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import {
  Person as PersonIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";
import { useAuth } from "@/auth/useAuth";
import { ROLE_LABEL } from "@/auth/permissions";

function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();
}

export function UserMenu() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  if (!user) return null;

  return (
    <>
    
      <Box sx={{ display: { xs: "none", sm: "block" }, textAlign: "right" }}>
        <Typography variant="body2" sx={{ fontWeight: 400, lineHeight: 1.2 }}>
          {user.full_name}  
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1 }}>
          {ROLE_LABEL[user.role]}
        </Typography>
      </Box>

      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        size="small"
        sx={{ p: 0 }}
        aria-controls={open ? "user-menu" : undefined}
        aria-haspopup="true"
        aria-expanded={open ? "true" : undefined}
      >
        <Avatar
          sx={{
            width: 40,
            height: 40,
            bgcolor: "primary.main",
            color: "primary.contrastText",
            fontSize: "0.95rem",
            fontWeight: 600,
          }}
        >
          {getInitials(user.full_name)}
        </Avatar>
      </IconButton>

      <Menu
        id="user-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        onClick={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 3,
          sx: { minWidth: 240, mt: 1, overflow: "visible" },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user.full_name}
          </Typography>
          <Box
            sx={{
              mt: 0.5,
              px: 1,
              py: 0.25,
              bgcolor: "primary.light",
              color: "primary.dark",
              borderRadius: 1,
              display: "inline-block",
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600 }}>
              {ROLE_LABEL[user.role]}
            </Typography>
          </Box>
        </Box>

        <Divider />

        <MenuItem onClick={() => navigate("/account/profile")}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Mi perfil
        </MenuItem>
        <MenuItem onClick={() => navigate("/account/security")}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Preferencias
        </MenuItem>

        <Divider />

        <MenuItem onClick={() => void logout()} sx={{ color: "error.main" }}>
          <ListItemIcon sx={{ color: "error.main" }}>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  );
}