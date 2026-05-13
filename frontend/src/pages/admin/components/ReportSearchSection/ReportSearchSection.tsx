import { Box, Stack, TextField, Button, CircularProgress } from "@mui/material";

interface Props {
  value: string;
  onChange: (val: string) => void;
  onSearch: () => void;
  loading: boolean;
}

export const ReportSearchSection = ({ value, onChange, onSearch, loading }: Props) => (
  <Box sx={{ mb: 3 }}>
    <Stack direction="row" spacing={2} sx={{ justifyContent: "center" }}>
      <TextField
        label="ID Navision"
        variant="outlined"
        size="small"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && onSearch()}
        sx={{ maxWidth: 300, width: "100%" }}
      />
      <Button
        variant="contained"
        onClick={onSearch}
        disabled={loading || !value.trim()}
      >
        Buscar
      </Button>
    </Stack>
    {loading && (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
        <CircularProgress size={24} />
      </Box>
    )}
  </Box>
);