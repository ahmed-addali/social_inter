import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/SocialInter.png";
import { useState } from "react";
import ButtonLoadingSpinner from "../components/loader/ButtonLoadingSpinner";
import { IoIosArrowRoundBack } from "react-icons/io";
import { signInAction } from "../redux/actions/adminActions";
import { useDispatch, useSelector } from "react-redux";

const AdminSignIn = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [signingIn, setSigningIn] = useState(false);

  const signInError = useSelector((state) => state.admin?.signInError);

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleSubmit = (e) => {
    setSigningIn(true);
    e.preventDefault();
    const data = {
      username: username,
      password: password,
    };

    dispatch(signInAction(data)).then(() => {
      setSigningIn(false);
      navigate("/admin");
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="w-full max-w-sm mx-auto overflow-hidden bg-white rounded-md shadow-md">
        <div className="px-6 py-4">
          <div className="logo" style={{widht:"100px"}}>
            <img src={logo} alt="" style={{ width: "140px", height: "auto" }} />
          </div>

          <p className="mt-1 text-center text-purple-400">Sign in as admin</p>
          <form>
            <div className="w-full mt-4">
              <input
                onChange={handleUsernameChange}
                className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-md  focus:border-pink-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-pink-300"
                type="text"
                placeholder="Username"
                aria-label="Username"
              />
            </div>
            <div className="w-full mt-4">
              <input
                onChange={handlePasswordChange}
                className="block w-full px-4 py-2 mt-2 text-gray-700 placeholder-gray-500 bg-white border rounded-md  focus:border-pink-400 focus:ring-opacity-40 focus:outline-none focus:ring focus:ring-pink-300"
                type="password"
                placeholder="Password"
                aria-label="Password"
              />
            </div>
            {signInError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative mt-4 flex items-center justify-between">
                <span className="block sm:inline">{signInError}</span>
              </div>
            )}

            <div className="flex items-center justify-between mt-4">
            <Link
                to="/"
                className="text-pink-500 hover:text-pink-700 transition-colors duration-300"
            >
                <IoIosArrowRoundBack className="inline-block w-4 h-4 mr-2" />
                Back to home
              </Link>

              <button
                disabled={signingIn}
                type="submit"
                onClick={(e) => handleSubmit(e)}
                className="px-6 py-2 text-sm font-medium tracking-wide text-white capitalize transition-colors duration-300 transform bg-gray-400 rounded-md hover:bg-gray-800 focus:outline-none focus:ring focus:ring-gray-800 focus:ring-opacity-50"
              >
                {signingIn ? (
                  <ButtonLoadingSpinner loadingText={"Signing in..."} />
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminSignIn;
