import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import Login from "@/pages/LoginPage.jsx";
import PlannerDashboard from "./pages/PlannerDashboard.jsx";
import EventDetails from "./pages/EventDetails.jsx";
import ClientDashboard from "./pages/ClientDashboard.jsx";
import Logout from "./pages/LogoutPage.jsx";
import PlannerSettings from './pages/PlannerSettings.jsx'; // Ensure this import is correct

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <h1 className="display-2">Wrong page!</h1>,
    children: [
      {
        index: true,
        element: <Login />,
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "planner-dashboard",
        element: <PlannerDashboard />,
      },
      {
        path: "eventdetails",
        element: <EventDetails />,
      },
      {
        path: "client-dashboard",
        element: <ClientDashboard />,
      },
      {
        path: "logout",
        element: <Logout />,
      },
      {
        path: "PlannerSettings",
        element: <PlannerSettings />, // Ensure this route is correctly defined
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);