import { Box, Button } from "@mui/material";

export type ConfirmModalProps = {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  isPending?: boolean;
  confirmText?: string;
  cancelText?: string;
};

function ConfirmModal({
  message,
  onConfirm,
  onCancel,
  isPending = false,
  confirmText = "delete",
  cancelText = "cancel",
}: ConfirmModalProps) {
  return (
    <Box
      sx={{
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        bgcolor: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: "15px",
      }}
    >
      <Box>{message}</Box>
      <Box sx={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
        <Button
          disabled={isPending}
          onClick={onCancel}
          variant="outlined"
          sx={{
            color: "#1b1a61",
            borderColor: "#1b1a61",
            "&:hover": {
              borderColor: "#151349",
              bgcolor: "rgba(27, 26, 97, 0.04)",
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          disabled={isPending}
          onClick={onConfirm}
          variant="contained"
          sx={{
            bgcolor: "#d32f2f",
            "&:hover": {
              bgcolor: "#c62828",
            },
          }}
        >
          {confirmText}
        </Button>
      </Box>
    </Box>
  );
}

export default ConfirmModal;
