import { Alert } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { TerminalDialogsPanel } from "./components/Dialogs/TerminalDialogsPanel";
import { TerminalMainContent } from "./components/TerminalMainContent";
import { TerminalLayout } from "../layouts/TerminalLayout";
import { useTerminalOrchestrator } from "./hooks/useTerminalOrchestrator";

export const TerminalPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const { operacionLoadErrorMessage, mainContentProps, dialogsProps } =
    useTerminalOrchestrator(id, navigate);

  return (
    <TerminalLayout>
      {operacionLoadErrorMessage && (
        <Alert severity="error" sx={{ mx: 2, mt: 2 }}>
          {operacionLoadErrorMessage}
        </Alert>
      )}

      <TerminalMainContent {...mainContentProps} />

      <TerminalDialogsPanel {...dialogsProps} />
    </TerminalLayout>
  );
};
