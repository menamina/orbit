import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./authContext";
import Index from "./index";

import MainPage from "./components/mainPage";
import OAuthToken from "./components/oauthToken";
// import Home from "./components/app/homePage";
import PillComponent from "./components/pill/pillComponent";
import Calendar from "./components/cycle/calendar";
import Note from "./components/notes/writeOrEditNote";
import Settings from "./components/settings/settings";

const queryClient = new QueryClient();

const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
    children: [
      {
        path: "login",
        element: <MainPage />,
      },
      {
        path: "auth/callback",
        element: <OAuthToken />,
      },
      {
        path: "pill",
        element: <PillComponent />,
      },
      {
        path: "cycle",
        element: <Calendar />,
      },
      {
        path: "notes",
        element: (
          <Note noteData={null} date={new Date().toISOString().split("T")[0]} />
        ),
      },
      {
        path: "account",
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
