import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./index.css";
import App from "./App.jsx";
import Login from "./views/LoginPage.jsx";
import PlannerDashboard from "./views/PlannerDashboard.jsx";
import EventDetails from "./views/EventDetails.jsx";
import ClientDashboard from "./views/ClientDashboard.jsx";
import Logout from "./views/LogoutPage.jsx";
import PlannerSettings from './views/PlannerSettings.jsx'; // Ensure this import is correct
import AdminPage from "./views/AdminPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <h1 className="display-2">Wrong page!</h1>,
    children: [
      { index: true, element: <Login />, },
      { path: "login", element: <Login />, },
      { path: "planner-dashboard", element: <PlannerDashboard />, },
      { path: "eventdetails", element: <EventDetails />, },
      { path: "client-dashboard", element: <ClientDashboard />, },
      { path: "logout", element: <Logout />,},
      { path: "PlannerSettings", element: <PlannerSettings />, },
      { path:  "admin", element: <AdminPage />}
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<RouterProvider router={router} />);