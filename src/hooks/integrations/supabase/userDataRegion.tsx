import React, { createContext, useContext, useMemo } from "react";
import {
  getSupabaseUserDataClient,
  getUserDataSupabaseConfig,
} from "./client";

const UserDataRegionContext = createContext<string>("");

type UserDataRegionProviderProps = {
  children: React.ReactNode;
  region?: string | null;
};

export const UserDataRegionProvider: React.FC<UserDataRegionProviderProps> = ({
  children,
  region = "",
}) => {
  return (
    <UserDataRegionContext.Provider value={region || ""}>
      {children}
    </UserDataRegionContext.Provider>
  );
};

export const useUserDataRegion = () => useContext(UserDataRegionContext);

export const useSupabaseUserData = () => {
  const region = useUserDataRegion();
  return useMemo(() => getSupabaseUserDataClient(region), [region]);
};

export const useUserDataSupabaseConfig = () => {
  const region = useUserDataRegion();
  return useMemo(() => getUserDataSupabaseConfig(region), [region]);
};
