import { useState, useEffect } from "react";
import { useAuth } from "../main";
import Alert from "@mui/material/Alert";

function ErrorDiv(error) {
  const [closeDiv, setCloseDiv] = useState(false);

  if (closeDiv === false) {
    return (
      <div>
        <Alert severity="warning" onClose={() => setCloseDiv(true)}>
          {error}
        </Alert>
      </div>
    );
  }
}

export default ErrorDiv;
