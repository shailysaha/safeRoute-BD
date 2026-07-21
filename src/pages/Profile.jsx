import "./Profile.css";

import { auth } from "../firebase/firebase";

import {
    signOut
} from "firebase/auth";

import {
    useNavigate
} from "react-router-dom";

function Profile() {

    const navigate = useNavigate();

    const user = auth.currentUser;

    const handleLogout = async () => {

        await signOut(auth);

        navigate("/login");

    };

    return (

        <div className="profile-page">

            <div className="profile-card">

                <img
                    src="https://ui-avatars.com/api/?name=User&background=2563eb&color=fff&size=180"
                    className="profile-image"
                    alt="profile"
                />

                <h2>
                    {user?.displayName || "SafeRoute User"}
                </h2>

                <p>{user?.email}</p>

                <div className="stats">

                    <div className="stat-box">
                        <h3>0</h3>
                        <span>Reports</span>
                    </div>

                    <div className="stat-box">
                        <h3>0</h3>
                        <span>Routes</span>
                    </div>

                    <div className="stat-box">
                        <h3>100</h3>
                        <span>Safety</span>
                    </div>

                </div>

                <div className="profile-info">

                    <h3>Personal Information</h3>

                    <p>
                        <strong>Name :</strong>
                        {" "}
                        {user?.displayName || "Not Set"}
                    </p>

                    <p>
                        <strong>Email :</strong>
                        {" "}
                        {user?.email}
                    </p>

                    <p>
                        <strong>Phone :</strong>
                        Not Set
                    </p>

                    <p>
                        <strong>District :</strong>
                        Not Set
                    </p>

                </div>

                <div className="profile-buttons">

                    <button>
                        Edit Profile
                    </button>

                    <button className="logout-btn"
                        onClick={handleLogout}
                    >
                        Logout
                    </button>

                </div>

            </div>

        </div>

    );

}

export default Profile;