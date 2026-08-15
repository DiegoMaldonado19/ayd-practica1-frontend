import { Outlet } from "react-router-dom";
import Box from "@mui/material/Box";

export function PublicLayout() {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      sx={{ bgcolor: "grey.100", p: 2 }}
      
    >
      <Outlet  />
    </Box>
  );
}
