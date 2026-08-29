import { Box, Paper, Button } from "@mui/material";

type IconsType = {
  [key: string]: string;
};

interface IconOptionsProps {
  images: IconsType;
  onSelect: (iconKey: string) => void;
  onClose: () => void;
}

function IconOptions({ images, onSelect, onClose }: IconOptionsProps) {
  return (
    <Box>
      <Box>Select an icon</Box>
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
              onSelect(key);
              onClose();
            }}
            sx={{
              cursor: "pointer",
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
      <Button onClick={onClose}>Cancel</Button>
    </Box>
  );
}

export default IconOptions;
