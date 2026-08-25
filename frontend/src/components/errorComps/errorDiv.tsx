import { useState, useEffect } from "react";
import { useAuth } from "../main";
import Alert from "@mui/material/Alert";

type Err = {
  error: string;
};

function ErrorDiv(error: Err) {
  const [closeDiv, setCloseDiv] = useState(false);

  if (closeDiv === false) {
    return (
      <div>
        <Alert severity="warning" onClose={() => setCloseDiv(true)}>
          {error.error}
        </Alert>
      </div>
    );
  }
}

export default ErrorDiv;
