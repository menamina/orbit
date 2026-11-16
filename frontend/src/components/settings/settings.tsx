import { useState } from "react";

import { Box } from "@mui/material";

import MainSettings from "./mainSettings";
import PasswordSettings from "./passwordSettings";
import DeleteSettings from "./dltSettings";

type Views = "main" | "password" | "delete";

function Settings() {
  const [view, setView] = useState<Views>("main");

  const viewOptions: { key: Views; label: string }[] = [
    { key: "main", label: "Settings" },
    { key: "password", label: "Password" },
    { key: "delete", label: "Delete Account" },
  ];

  return (
    <>
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
        }}
      >
        {viewOptions.map(({ key, label }) => (
          <button
            className="button"
            key={key}
            onClick={() => {
              if (view !== key) {
                setView(key);
              }
            }}
          >
            {label}
          </button>
        ))}
      </Box>
      <Box className="settingsRendered">
        {view === "main" && <MainSettings />}
        {view === "password" && <PasswordSettings />}
        {view === "delete" && (
          <DeleteSettings setSettingsView={(v: Views) => setView(v)} />
        )}
      </Box>
    </>
  );
}

export default Settings;
