import { useState } from "react";
import { Box, Button } from "@mui/material";

interface IconOptionsProps {
  images: Record<string, string>;
  usersCurrentImg: string;
  onSelect: (iconKey: string) => void;
  onClose: () => void;
}

function IconOptions({
  images,
  usersCurrentImg,
  onSelect,
  onClose,
}: IconOptionsProps) {
  const [clickedIcon, setClickedIcon] = useState<string>("");

  return (
    <Box>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "10px",
        }}
      >
        {Object.entries(images).map(([key, imgSrc]) => (
          <Box
            key={key}
            onClick={() => {
              setClickedIcon(key);
            }}
            sx={{
              cursor: "pointer",
              border:
                usersCurrentImg === key
                  ? "1px solid gray"
                  : clickedIcon === key
                    ? "1px solid blue"
                    : null,
              "&:hover": {
                opacity: 0.7,
              },
            }}
          >
            <img
              src={imgSrc}
              alt={key}
              style={{ width: "100%", height: "auto" }}
            />
          </Box>
        ))}
      </Box>
      <Box>
        <Button onClick={onClose}>cancel</Button>
        <Button
          disabled={!clickedIcon}
          onClick={() => {
            onSelect(clickedIcon);
            onClose();
          }}
        >
          save
        </Button>
      </Box>
    </Box>
  );
}

export default IconOptions;
