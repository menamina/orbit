import { useState } from "react";
import Alert from "@mui/material/Alert";

type Err = {
  error: string | Error;
};

function ErrorDiv(error: Err) {
  const [closeDiv, setCloseDiv] = useState(false);

  const errorMessage =
    typeof error.error === "string" ? error.error : error.error.message;

  if (closeDiv === false) {
    return (
      <div className="errorDIV">
        <Alert severity="warning" onClose={() => setCloseDiv(true)}>
          {errorMessage}
        </Alert>
      </div>
    );
  }
}

export default ErrorDiv;
