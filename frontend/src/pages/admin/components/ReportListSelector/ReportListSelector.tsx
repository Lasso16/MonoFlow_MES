import { Box, List, ListItemButton, ListItemText, Typography, CircularProgress } from "@mui/material";

interface Props {
  items: any[];
  selectedId?: string;
  onSelect: (item: any) => void;
  title: string;
  loading?: boolean;
  isOperation?: boolean;
}

export const ReportListSelector = ({ items, selectedId, onSelect, title, loading, isOperation }: Props) => {
  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}><CircularProgress size={24} /></Box>;
  }

  if (items.length === 0) return null;

  return (
    <>
      <Typography variant="subtitle2" sx={{ mb: 1, mt: 2 }}>{title}</Typography>
      <Box sx={{ 
        maxHeight: 220, 
        overflow: "auto", 
        border: "1px solid", 
        borderColor: "divider", 
        borderRadius: 1 
      }}>
        <List disablePadding>
          {items.map((item) => (
            <ListItemButton
              key={item.id}
              selected={selectedId === item.id}
              onClick={() => onSelect(item)}
            >
              <ListItemText
                primary={isOperation ? item.tipoOperacion : `Navision: ${item.idNavision}`}
                secondary={isOperation 
                  ? `Artículo: ${item.articuloDescripcion ?? "—"} · Cantidad: ${item.cantidadTotal}`
                  : `${item.descripcion}${item.cliente ? ` · ${item.cliente}` : ""}`
                }
              />
            </ListItemButton>
          ))}
        </List>
      </Box>
    </>
  );
};