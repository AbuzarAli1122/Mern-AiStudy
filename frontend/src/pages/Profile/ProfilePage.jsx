import React, { useState, useEffect } from "react";
import PageHeader from "../../components/common/PageHeader";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import authService from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import toast from "react-hot-toast";
import {
  User as UserIcon,
  Mail as MailIcon,
  Lock as LockIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
} from "lucide-react";

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await authService.getProfile();
        setUsername(data.username);
        setEmail(data.email);
      } catch (error) {
        toast.error("Failed to load profile");
        console.error("Profile Load Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);


  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New password and confirm password do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("New password must be at least 6 characters");
      return;
    }
    setPasswordLoading(true);
    try {
      await authService.changePassword({currentPassword, newPassword, confirmPassword});
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Failed to change password");
      console.error("Change Password Error:", error);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <PageHeader title="Profile" />

      <div className="space-y-8">
        {/* User Info */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-neutral-900 mb-4">
            User Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5 ">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
                  <UserIcon className="w-4 h-4 text-neutral-400" />
                </div>
                <p className="w-full h-9 pl-9 pr-3 pt-2 border border-neutral-200 rounded-lg bg-neutral-50  text-sm text-neutral-900">
                  {username}
                </p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
                  <MailIcon className="w-4 h-4 text-neutral-400" />
                </div>
                <p className="w-full h-9 pl-9 pr-3 pt-2 border border-neutral-200 rounded-lg bg-neutral-50  text-sm text-neutral-900">
                  {email}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="bg-white border border-neutral-200 rounded-lg p-6">
          <h3 className=" text-lg font-semibold text-neutral-900 mb-4">
            Change Password
          </h3>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
                  <LockIcon className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type={showCurrent ? "text" : "password"}
                  className="w-full h-9 pl-9 pr-3 pt-1 border border-neutral-200 rounded-lg bg-white  text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
                {/* Eye icon (right) */}
                {currentPassword && (
                  <button
                    type="button"
                    onClick={() => setShowCurrent((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors duration-200"
                  >
                    {showCurrent ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeOffIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
                  <LockIcon className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type={showNew ? "text" : "password"}
                  className="w-full h-9 pl-9 pr-3 pt-1 border border-neutral-200 rounded-lg bg-white  text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
                {/* Eye icon (right) */}
                {newPassword && (
                  <button
                    type="button"
                    onClick={() => setShowNew((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors duration-200"
                  >
                    {showNew ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeOffIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-700 mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center  pointer-events-none">
                  <LockIcon className="w-4 h-4 text-neutral-400" />
                </div>
                <input
                  type={showConfirm ? "text" : "password"}
                  className="w-full  h-9 pl-9 pr-3 pt-1 border border-neutral-200 rounded-lg bg-white  text-sm text-neutral-900 placeholder-neutral-400 transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-[#00d492] focus:border-transparent"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                {/* Eye icon (right) */}
                {confirmPassword && (
                  <button
                    type="button"
                    onClick={() => setShowConfirm((prev) => !prev)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-emerald-500 transition-colors duration-200"
                  >
                    {showConfirm ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeOffIcon className="h-5 w-5" />
                    )}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={passwordLoading}>
                {passwordLoading ? "Changing..." : "Change Password"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
