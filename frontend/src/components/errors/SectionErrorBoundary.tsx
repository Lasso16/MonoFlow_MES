import { Alert, Box, Button } from "@mui/material";
import type { ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

type SectionErrorBoundaryProps = {
  sectionName: string;
  children: ReactNode;
};

type SectionErrorFallbackProps = FallbackProps & {
  sectionName: string;
};

const SectionErrorFallback = ({ sectionName, resetErrorBoundary }: SectionErrorFallbackProps) => {
  return (
    <Box sx={{ border: "1px solid", borderColor: "error.light", borderRadius: 2, p: 2, bgcolor: "error.50" }}>
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={resetErrorBoundary}>
            Reintentar
          </Button>
        }
      >
        {`Error en ${sectionName}. Intente recargar esta sección`}
      </Alert>
    </Box>
  );
};

export const SectionErrorBoundary = ({ sectionName, children }: SectionErrorBoundaryProps) => {
  return (
    <ErrorBoundary
      FallbackComponent={(fallbackProps) => (
        <SectionErrorFallback sectionName={sectionName} {...fallbackProps} />
      )}
    >
      {children}
    </ErrorBoundary>
  );
};
