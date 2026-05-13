import { useState } from "react";
import { Box, Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs, Button } from "@mui/material";
import { useAdminOperacionData } from "../../hooks/useAdminOperacionData";
import TabHistorial from "../TabHistorial/TabHistorial";
import TabRegistroActual from "../TabRegistroActual/TabRegistroActual";


type AdminOperacionDialogProps = {
  operacionId: string | null;
  operacionTipo: string;
  onClose: () => void;
};

export const AdminOperacionDialog = ({ operacionId, operacionTipo, onClose }: AdminOperacionDialogProps) => {
  const [tabIndex, setTabIndex] = useState(0);
  const data = useAdminOperacionData(operacionId);

  return (
    <Dialog open={Boolean(operacionId)} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ pb: 0 }}>Detalle de Operación{operacionTipo ? ` - ${operacionTipo}` : ""}</DialogTitle>

      <Box sx={{ borderBottom: 1, borderColor: "divider", px: 3, mt: 1 }}>
        <Tabs value={tabIndex} onChange={(_, newValue) => setTabIndex(newValue)}>
          <Tab label="Registro Actual" />
          <Tab label="Historial" />
        </Tabs>
      </Box>

      <DialogContent sx={{ pt: 2, minHeight: "400px", bgcolor: "grey.50" }}>
        {tabIndex === 0 ? <TabRegistroActual {...data} /> : <TabHistorial {...data} />}
      </DialogContent>

      <DialogActions sx={{ bgcolor: "white" }}>
        <Button onClick={onClose}>Cerrar</Button>
      </DialogActions>
    </Dialog>
  );
};

export default AdminOperacionDialog;
