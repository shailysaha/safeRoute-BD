import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

import { auth, db } from "../firebase/firebase";
import DashboardLayout from "../layout/DashboardLayout";
import "./Profile.css";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        if (!currentUser) {
          setProfile(null);
          setLoading(false);
          return;
        }

        try {
          const userSnapshot = await getDoc(
            doc(db, "users", currentUser.uid)
          );

          const firestoreData = userSnapshot.exists()
            ? userSnapshot.data()
            : {};

          setProfile({
            uid: currentUser.uid,
            name:
              firestoreData.name ||
              currentUser.displayName ||
              "SafeRoute User",
            email: currentUser.email || "",
            role: firestoreData.role || "user",
            emailVerified: currentUser.emailVerified,
            createdAt:
              firestoreData.createdAt ||
              currentUser.metadata.creationTime ||
              "",
          });
        } catch (profileError) {
          console.error("Profile loading error:", profileError);
          setError("Unable to load your profile.");
        } finally {
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const formatDate = (dateValue) => {
    if (!dateValue) {
      return "Unavailable";
    }

    const date =
      typeof dateValue?.toDate === "function"
        ? dateValue.toDate()
        : new Date(dateValue);

    if (Number.isNaN(date.getTime())) {
      return "Unavailable";
    }

    return date.toLocaleString("en-BD", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getInitials = (name) => {
    if (!name) return "U";

    return name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="profile-message">
          Loading profile...
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="profile-message profile-error">
          {error}
        </div>
      </DashboardLayout>
    );
  }

  if (!profile) {
    return (
      <DashboardLayout>
        <div className="profile-message">
          Please log in to view your profile.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <main className="profile-page">
        <section className="profile-header-card">
          <div className="profile-avatar">
            {getInitials(profile.name)}
          </div>

          <div className="profile-header-text">
            <span className="profile-label">
              SafeRoute BD account
            </span>

            <h1>{profile.name}</h1>
            <p>{profile.email}</p>
          </div>

          <span
            className={`profile-role ${
              profile.role === "admin"
                ? "profile-role-admin"
                : "profile-role-user"
            }`}
          >
            {profile.role === "admin"
              ? "Administrator"
              : "Community User"}
          </span>
        </section>

        <section className="profile-details-card">
          <div className="profile-section-heading">
            <div>
              <h2>Personal Information</h2>
              <p>Your SafeRoute BD account information</p>
            </div>
          </div>

          <div className="profile-details-grid">
            <div className="profile-detail">
              <span>👤</span>

              <div>
                <small>Full name</small>
                <strong>{profile.name}</strong>
              </div>
            </div>

            <div className="profile-detail">
              <span>✉️</span>

              <div>
                <small>Email address</small>
                <strong>{profile.email}</strong>
              </div>
            </div>

            <div className="profile-detail">
              <span>🛡️</span>

              <div>
                <small>Account role</small>
                <strong>
                  {profile.role === "admin"
                    ? "Administrator"
                    : "User"}
                </strong>
              </div>
            </div>

            <div className="profile-detail">
              <span>
                {profile.emailVerified ? "✅" : "⚠️"}
              </span>

              <div>
                <small>Email status</small>
                <strong>
                  {profile.emailVerified
                    ? "Verified"
                    : "Not verified"}
                </strong>
              </div>
            </div>

            <div className="profile-detail">
              <span>📅</span>

              <div>
                <small>Account created</small>
                <strong>
                  {formatDate(profile.createdAt)}
                </strong>
              </div>
            </div>

            <div className="profile-detail">
              <span>🔑</span>

              <div>
                <small>User ID</small>
                <strong className="profile-uid">
                  {profile.uid}
                </strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}

export default Profile;