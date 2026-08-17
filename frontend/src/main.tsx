import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./authContext";
import Index from "./index";

import Login from "./components/login";
import OAuthToken from "./components/oauthToken";
import Home from "./components/homePage";
import Pill from "./components/pillPack";
import Cycle from "./components/cycleTracking";
import Notes from "./components/notes";
import Settings from "./components/settings";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "auth/callback",
        element: <OAuthToken />,
      },
      {
        path: "pill",
        element: <Pill />,
      },
      {
        path: "cycle",
        element: <Cycle />,
      },
      {
        path: "notes",
        element: <Notes />,
      },
      {
        path: "settings",
        element: <Settings />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
