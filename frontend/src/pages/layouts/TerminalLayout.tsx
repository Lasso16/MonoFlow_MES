import type { PropsWithChildren } from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import { TerminalHeader } from "../terminal/components/TerminalHeader/TerminalHeader";

export const TerminalLayout = ({ children }: PropsWithChildren) => {
  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <TerminalHeader />
      <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {children ?? <Outlet />}
      </Box>
    </Box>
  );
};
