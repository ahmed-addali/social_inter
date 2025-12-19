import React from "react";
import { useSelector } from "react-redux";
import { AiOutlineEye } from "react-icons/ai";

const DemoBanner = () => {
  const userData = useSelector((state) => state.auth?.userData);
  
  // Only show banner if user is the demo account
  if (userData?.email !== "demo@socialecho.com") {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-center gap-2 text-sm md:text-base">
          <AiOutlineEye className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">
            You're in Demo Mode
          </span>
          <span className="hidden md:inline text-white/90">
            - Feel free to explore all features! Changes won't affect real users.
          </span>
        </div>
      </div>
    </div>
  );
};

export default DemoBanner;
