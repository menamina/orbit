import { Box, Button } from "@mui/material";

type Err = {
  error: string | Error;
  onClose?: () => void;
};

function ErrorModal({ error, onClose }: Err) {
  const err = typeof error === "string" ? error : error.message;

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
      }}
    >
      <div>{err}</div>
      {onClose && (
        <Button
          onClick={onClose}
          variant="contained"
          sx={{
            marginTop: "15px",
            bgcolor: "#1b1a61",
            "&:hover": {
              bgcolor: "#151349",
            },
          }}
        >
          Go to Login
        </Button>
      )}
    </Box>
  );
}

export default ErrorModal;
