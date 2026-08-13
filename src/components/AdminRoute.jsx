import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebase";

function AdminRoute({ children }) {
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setStatus("logged-out");
          return;
        }

        try {
          const userSnapshot = await getDoc(
            doc(db, "users", currentUser.uid)
          );

          if (!userSnapshot.exists()) {
            setStatus("forbidden");
            return;
          }

          const role = userSnapshot.data().role;

          console.log("Current UID:", currentUser.uid);
          console.log("Current role:", role);

          if (role === "admin") {
            setStatus("admin");
          } else {
            setStatus("forbidden");
          }
        } catch (error) {
          console.error("Admin role check failed:", error);
          setStatus("forbidden");
        }
      }
    );

    return () => unsubscribe();
  }, []);

  if (status === "loading") {
    return <div>Checking admin permission...</div>;
  }

  if (status === "logged-out") {
    return <Navigate to="/login" replace />;
  }

  if (status === "forbidden") {
    return <Navigate to="/" replace />;
  }

  return children;
}

export default AdminRoute;