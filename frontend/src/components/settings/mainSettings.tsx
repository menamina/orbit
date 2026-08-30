import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettingsQuery, updateSettingsMut } from "../../tanstack/settingsTS";
import {
  checkIfUsernameIsInUse,
  checkIfEmailIsInUse,
} from "../../tanstack/authTS";

import { ApiError } from "../../tanstack/api";
import type { SettingsType } from "../tanstack/SettingsType";

import { Box, TextField } from "@mui/material";

import ErrorDiv from "../errorComps/errorDiv";
import ErrorModal from "../errorComps/errorModal";
import IconOptions from "./iconOptions";

import PhotoChange from "../../imgs/changePhoto.svg";

import Cheesecake from "../../icons/cheesecake.jpeg";
import Coffee from "../../icons/coffee.jpeg";
import Fpeach from "../../icons/fpeach.jpeg";
import Greenflower from "../../icons/greenflower.jpeg";
import Sugar from "../../icons/sugar.jpeg";
import Lily from "../../icons/lily.jpeg";
import LittleBabyBunny from "../../icons/Little baby bunny Calico Critter !!.jpeg";
import Lotion from "../../icons/lotion.jpeg";
import Lychee from "../../icons/lychee.jpeg";
import SlicePeach from "../../icons/slicePeach.jpeg";
import Lavendar from "../../icons/lavendar.jpeg";
import SkyBlueOrchid from "../../icons/Sky Blue Orchid.jpeg";
import Star from "../../icons/star.jpeg";

const icons = {
  cheesecake: Cheesecake,
  coffee: Coffee,
  fpeach: Fpeach,
  greenflower: Greenflower,
  sugar: Sugar,
  lily: Lily,
  littleBabyBunny: LittleBabyBunny,
  lotion: Lotion,
  lychee: Lychee,
  slicePeach: SlicePeach,
  lavendar: Lavendar,
  skyBlueOrchid: SkyBlueOrchid,
  star: Star,
};

function MainSettings() {
  const { accessToken, setAccessToken, setUser } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { data: userSettings, error: getSettingsError } = useQuery({
    ...getSettingsQuery(accessToken, setAccessToken),
    retry: false,
  });

  const [edit, setEdit] = useState(false);

  const [usernameQuery, setUsernameQuery] = useState("");
  const [emailQuery, setEmailQuery] = useState("");

  const [settingsToUpdate, setSettingsToUpdate] = useState<SettingsType>({
    name: userSettings?.name || "",
    username: userSettings?.username || "",
    email: userSettings?.email || "",
    icon: userSettings?.icon || "",
    cycleLength: userSettings?.cycleLength,
    daysBetweenPeriod: userSettings?.daysBetweenPeriod,
  });

  const [openImgOptions, setOpenImgOptions] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const { error: usernameInUseError } = useQuery(
    checkIfUsernameIsInUse(usernameQuery),
  );

  const { error: emailInUseError } = useQuery(checkIfEmailIsInUse(emailQuery));

  useEffect(() => {
    if (
      settingsToUpdate.username === "" ||
      userSettings?.username === settingsToUpdate.username
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setUsernameQuery(settingsToUpdate.username);
    }, 300);

    return () => clearTimeout(timer);
  }, [settingsToUpdate.username, userSettings?.username]);

  useEffect(() => {
    if (
      settingsToUpdate.email === "" ||
      userSettings?.email === settingsToUpdate.email
    ) {
      return;
    }

    const timer = setTimeout(() => {
      setEmailQuery(settingsToUpdate.email);
    }, 300);

    return () => clearTimeout(timer);
  }, [settingsToUpdate.email, userSettings?.email]);

  const {
    mutate: updateSettings,
    isPending: settingsUpdatePending,
    error: updateSettingsError,
  } = useMutation({
    ...updateSettingsMut(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["usersSettings"] });
    },
    onError: (error) => {
      if (error instanceof ApiError && error.isAuthError()) {
        setShowLoginModal(true);
      }
    },
  });

  const isFormValid = Object.values(settingsToUpdate).every((value) => {
    if (typeof value === "string") {
      return value.trim() !== "";
    }
    if (typeof value === "number") {
      return value > 0;
    }
    return true;
  });

  return (
    <>
      <Box>
        {updateSettingsError && !showLoginModal && (
          <ErrorDiv error={updateSettingsError} />
        )}
        {getSettingsError && !showLoginModal && (
          <ErrorDiv error={getSettingsError} />
        )}

        <Box
          onClick={() => (edit ? setOpenImgOptions(true) : null)}
          sx={{
            cursor: openImgOptions ? "default" : "pointer",
            position: "relative",
          }}
        >
          {edit && (
            <img
              src={PhotoChange}
              alt="camera image indicating ability to change photo"
              style={{
                position: "absolute",
                zIndex: 1,
              }}
            />
          )}
          <img
            src={
              openImgOptions
                ? icons[settingsToUpdate.icon as keyof typeof icons]
                : icons[userSettings?.icon as keyof typeof icons]
            }
            alt={`your profile picutre is ${userSettings.icon}`}
          />
        </Box>
        {!edit && (
          <>
            <Box>
              {[
                { label: "Name", value: userSettings?.name },
                { label: "Username", value: userSettings?.username },
                { label: "Email", value: userSettings?.email },
              ].map(({ label, value }) => (
                <Box key={label}>
                  {label}: {value}
                </Box>
              ))}
            </Box>

            <Box>
              <Box>Cycle</Box>
              <Box>
                {[
                  {
                    label: "Cycle Length",
                    value: userSettings?.cycleLength,
                    suffix: " days",
                  },
                  {
                    label: "Days between period",
                    value: userSettings?.daysBetweenPeriod,
                    suffix: " days",
                  },
                ].map(({ label, value, suffix }) => (
                  <Box key={label}>
                    {label}: {value}
                    {suffix}
                  </Box>
                ))}
              </Box>
            </Box>

            <button onClick={() => setEdit(true)}>edit</button>
          </>
        )}
        {edit && (
          <>
            {[
              { key: "name", label: "Name" },
              { key: "username", label: "Username" },
              { key: "email", label: "Email" },
            ].map(({ key, label }) => {
              const errorObj =
                key === "username"
                  ? usernameInUseError
                  : key === "email"
                    ? emailInUseError
                    : null;

              return (
                <TextField
                  key={key}
                  label={label}
                  value={settingsToUpdate[key]}
                  onChange={(e) =>
                    setSettingsToUpdate({
                      ...settingsToUpdate,
                      [key]: e.target.value,
                    })
                  }
                  error={!!errorObj}
                  helperText={errorObj?.error || ""}
                  variant="outlined"
                  fullWidth
                />
              );
            })}

            <Box>
              <Box>Cycle</Box>
              <Box>
                {[
                  { key: "cycleLength", label: "Cycle Length" },
                  { key: "daysBetweenPeriod", label: "Days between period" },
                ].map(({ key, label }) => (
                  <TextField
                    key={key}
                    label={label}
                    type="number"
                    value={settingsToUpdate[key] || ""}
                    onChange={(e) =>
                      setSettingsToUpdate({
                        ...settingsToUpdate,
                        [key]: Number(e.target.value),
                      })
                    }
                    variant="outlined"
                    fullWidth
                  />
                ))}
              </Box>
            </Box>
            <Box>
              <button
                onClick={() => {
                  setEdit(false);
                  setOpenImgOptions(false);
                }}
              >
                cancel
              </button>
              <button
                disabled={
                  !isFormValid ||
                  settingsUpdatePending ||
                  !!usernameInUseError ||
                  !!emailInUseError
                }
                onClick={() =>
                  updateSettings({
                    accessToken,
                    onTokenRefresh: setAccessToken,
                    ...settingsToUpdate,
                  })
                }
              >
                save
              </button>
            </Box>
          </>
        )}
      </Box>
      {openImgOptions && (
        <IconOptions
          images={icons}
          usersCurrentImg={settingsToUpdate.icon}
          onSelect={(iconKey) =>
            setSettingsToUpdate({ ...settingsToUpdate, icon: iconKey })
          }
          onClose={() => setOpenImgOptions(false)}
        />
      )}

      {showLoginModal && (
        <ErrorModal
          error="Your session expired. Please login again."
          onClose={() => {
            setAccessToken(null);
            setUser(null);
            navigate("/login");
          }}
        />
      )}
    </>
  );
}

export default MainSettings;
