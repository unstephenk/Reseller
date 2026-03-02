import { createBrowserRouter } from "react-router-dom";
import App from "./App";
import { LotDetail } from "./features/lots/LotDetail";

export const router = createBrowserRouter([
  { path: "/", element: <App /> },
  { path: "/lots/:id", element: <LotDetail /> },
]);
