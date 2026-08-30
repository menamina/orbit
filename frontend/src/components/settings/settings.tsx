import { useState } from "react";

import { Box } from "@mui/material";

import MainSettings from "./mainSettings";
import PasswordSettings from "./passwordSettings";
import DeleteSettings from "./dltSettings";

type Views = "main" | "password" | "delete";

function Settings() {
  const [view, setView] = useState<Views>("main");

  return (
    <>
      <Box>
        <button
          onClick={() => {
            if (view !== "main") {
              setView("main");
            }
          }}
        >
          Settings
        </button>
        <button
          onClick={() => {
            if (view !== "password") {
              setView("password");
            }
          }}
        >
          Password
        </button>
        <button
          onClick={() => {
            if (view !== "delete") {
              setView("delete");
            }
          }}
        >
          Delete Account
        </button>
      </Box>
      <Box>
        {view === "main" && <MainSettings />}
        {view === "password" && <PasswordSettings />}
        {view === "delete" && <DeleteSettings setSettingsView={setView} />}
      </Box>
    </>
  );
}

export default Settings;
