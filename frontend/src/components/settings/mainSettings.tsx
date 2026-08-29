import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../authContext";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSettingsQuery, updateSettingsMut } from "../../tanstack/settingsTS";

import { ApiError } from "../../tanstack/api";
import type { SettingsType } from "../tanstack/SettingsType";

import { Box, Paper, Button } from "@mui/material";

import ErrorDiv from "../errorComps/errorDiv";
import ErrorModal from "../errorComps/errorModal";

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

  const [edit, setEdit] = useState(false);

  const [showLoginModal, setShowLoginModal] = useState(false);

  const { data: userSettings, error: getSettingsError } = useQuery({
    ...getSettingsQuery(accessToken, setAccessToken),
  });

    const [settingsToUpdate, setSettingsToUpdate] = useState<SettingsType>({
    name: {userSettings.name},
    username: {userSettings.username},
    email: {userSettings.email},
    icon: {userSettings.icon},
    cycleLength: {userSettings.cycleLength},
    daysBetweenPeriod: {userSettings.daysBetweenPeriod},
  });const {
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

  return (
    <>
      <Box>
        <Box>
          <img
            src={icons[userSettings?.icon as keyof typeof icons]}
            alt={`your profile picutre is ${userSettings.icon}`}
          />
        </Box>
        {!edit && (
          <>
            <Box>
              <Box>Name: {userSettings?.name}</Box>
              <Box>Username: {userSettings?.username}</Box>
              <Box>Email: {userSettings?.email}</Box>
            </Box>

            <Box>
              <Box>Cycle</Box>
              <Box>
                <Box>Cycle Length: {userSettings?.cycleLength} days</Box>
                <Box>
                  Days between period: {userSettings?.daysBetweenPeriod}
                </Box>
              </Box>
            </Box>

            <button onClick={() => setEdit(true)}>edit</button>
          </>
        )}
        {edit && (
          <>
            <Box>
              <label>Name:</label>
              <input value={} />
            </Box>
            <Box>
              <label></label>
              <input />
            </Box>
            <Box>
              <label></label>
              <input />
            </Box>

            <Box>
              <Box>Cycle</Box>
              <Box>
                <label></label>
                <input />
              </Box>
            </Box>
            <Box>
              <button onClick={() => setEdit(false)}>cancel</button>
              <button disabled={settingsUpdatePending} onClick={() => updateSettings(settingsToUpdate)}>save</button>
            </Box>
          </>
        )}
      </Box>
    </>
  );
}
// icon option pop up on side

export default MainSettings;
