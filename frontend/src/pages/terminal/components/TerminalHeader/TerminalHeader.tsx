import { AppBar, Box, Toolbar, Typography } from '@mui/material';

export const TerminalHeader = () => {
  return (
    <AppBar
      position="absolute"
      elevation={0}
      sx={{
        bgcolor: 'common.white',
        color: 'grey.900',
        borderBottom: 1,
        borderColor: 'grey.200',
      }}
    >
      <Toolbar sx={{ minHeight: 'fit-content !important', py: 0.625 }}>
        <Box sx={{ width: 1, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 800, letterSpacing: 0.2 }}>
            MonoFlow
          </Typography>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
