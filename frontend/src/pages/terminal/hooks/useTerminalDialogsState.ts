import { useEffect, useState } from 'react';

export const useTerminalDialogsState = (operacionId?: string) => {
  const [isObservacionDialogOpen, setIsObservacionDialogOpen] = useState(false);
  const [observacionText, setObservacionText] = useState('');

  const [isProduccionDialogOpen, setIsProduccionDialogOpen] = useState(false);
  const [piezasBuenasText, setPiezasBuenasText] = useState('');
  const [piezasRechazadasText, setPiezasRechazadasText] = useState('');
  const [selectedRechazoId, setSelectedRechazoId] = useState('');
  const [rechazoComentario, setRechazoComentario] = useState('');

  useEffect(() => {
    setIsObservacionDialogOpen(false);
    setObservacionText('');

    setIsProduccionDialogOpen(false);
    setPiezasBuenasText('');
    setPiezasRechazadasText('');
    setSelectedRechazoId('');
    setRechazoComentario('');
  }, [operacionId]);

  return {
    isObservacionDialogOpen,
    setIsObservacionDialogOpen,
    observacionText,
    setObservacionText,
    isProduccionDialogOpen,
    setIsProduccionDialogOpen,
    piezasBuenasText,
    setPiezasBuenasText,
    piezasRechazadasText,
    setPiezasRechazadasText,
    selectedRechazoId,
    setSelectedRechazoId,
    rechazoComentario,
    setRechazoComentario,
  };
};
