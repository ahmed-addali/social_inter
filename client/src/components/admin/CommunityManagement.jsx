import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  getCommunitiesAction,
  getModeratorsAction,
  addModeratorAction,
  removeModeratorAction,
  getCommunityAction,
  createCommunityAction,
  updateCommunityAction,
  deleteCommunityAction,
} from "../../redux/actions/adminActions";

const CommunityManagement = () => {
  const dispatch = useDispatch();
  const communities = useSelector((state) => state.admin?.communities);
  const moderators = useSelector((state) => state.admin?.moderators);
  const community = useSelector((state) => state.admin?.community);

  useEffect(() => {
    dispatch(getCommunitiesAction());
    dispatch(getModeratorsAction());
  }, [dispatch]);

  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedCommunityData, setSelectedCommunityData] = useState(null);
  const [selectedModerator, setSelectedModerator] = useState(null);
  const [newModerator, setNewModerator] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [isChangingCommunity, setIsChangingCommunity] = useState(false);
  const [showAddCommunityModal, setShowAddCommunityModal] = useState(false);
  const [showEditCommunityModal, setShowEditCommunityModal] = useState(false);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [communityForm, setCommunityForm] = useState({
    name: "",
    description: "",
    banner: "",
  });
  const [formError, setFormError] = useState("");

  const handleCommunitySelect = async (community) => {
    setSelectedCommunity(community);
    setIsChangingCommunity(true);
    await dispatch(getCommunityAction(community._id));
    setIsChangingCommunity(false);
  };

  useEffect(() => {
    setSelectedCommunityData(community);
  }, [community]);

  const handleModeratorSelect = (moderator) => {
    setSelectedModerator(moderator);
  };

  const handleRemoveModerator = async (moderator) => {
    setIsUpdating(true);
    await dispatch(
      removeModeratorAction(selectedCommunityData._id, moderator._id)
    );
    await dispatch(getCommunityAction(selectedCommunityData._id));
    await dispatch(addModeratorAction(selectedCommunityData._id, newModerator));
    await dispatch(getModeratorsAction());
    setIsUpdating(false);
  };
  const handleAddModerator = async () => {
    setIsUpdating(true);
    await dispatch(addModeratorAction(selectedCommunityData._id, newModerator));
    await dispatch(getCommunityAction(selectedCommunityData._id));
    await dispatch(getModeratorsAction());
    setNewModerator("");
    setIsUpdating(false);
  };

  // Function to reset form state
  const resetFormState = () => {
    setCommunityForm({
      name: "",
      description: "",
      banner: "",
    });
    setFormError("");
  };

  // Open the add community modal
  const handleAddCommunity = () => {
    resetFormState();
    setShowAddCommunityModal(true);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCommunityForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Submit new community
  const handleCreateCommunity = async () => {
    // Validate form
    if (!communityForm.name || !communityForm.description) {
      setFormError("Name and description are required");
      return;
    }

    setIsUpdating(true);
    
    try {
      const result = await dispatch(createCommunityAction(communityForm));
      
      if (result.success) {
        setShowAddCommunityModal(false);
        resetFormState();
      } else {
        setFormError(result.error || "Failed to create community");
      }
    } catch (error) {
      setFormError("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  // Open the edit community modal
  const handleUpdateCommunity = (community) => {
    resetFormState();
    setCommunityForm({
      name: community.name,
      description: community.description || "",
      banner: community.banner || "",
    });
    setShowEditCommunityModal(true);
  };

  // Submit community update
  const handleSaveUpdate = async () => {
    // Validate form
    if (!communityForm.name || !communityForm.description) {
      setFormError("Name and description are required");
      return;
    }

    setIsUpdating(true);
    
    try {
      const result = await dispatch(updateCommunityAction(selectedCommunity._id, communityForm));
      
      if (result.success) {
        setShowEditCommunityModal(false);
        resetFormState();
      } else {
        setFormError(result.error || "Failed to update community");
      }
    } catch (error) {
      setFormError("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  // Open the delete confirmation modal
  const handleDeleteCommunity = (community) => {
    setSelectedCommunity(community);
    setShowDeleteConfirmModal(true);
  };

  // Confirm community deletion
  const handleConfirmDelete = async () => {
    if (!selectedCommunity) return;
    
    setIsUpdating(true);
    
    try {
      const result = await dispatch(deleteCommunityAction(selectedCommunity._id));
      
      if (result.success) {
        setShowDeleteConfirmModal(false);
        setSelectedCommunity(null);
        setSelectedCommunityData(null);
      } else {
        setFormError(result.error || "Failed to delete community");
      }
    } catch (error) {
      setFormError("An unexpected error occurred");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!communities || !moderators) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex gap-2 h-[85vh] w-full mt-3 border rounded-md">
      {/* Left column */}
      <div className="flex flex-col w-full bg-white shadow-inner rounded-md border-r">
        <div className="flex justify-between items-center border-b-2">
          <h1 className="text-lg font-bold p-4 text-center">
            Communities
          </h1>
          <button 
            onClick={handleAddCommunity}
            className="mr-4 bg-green-500 text-white p-2 rounded-full hover:bg-green-600"
            title="Add new community"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <div className="flex flex-col overflow-y-auto">
          {communities.map((community) => (
            <div
              key={community._id}
              className={`p-4 cursor-pointer hover:bg-background border-b flex items-center justify-between ${
                selectedCommunity?._id === community._id ? "bg-gray-200" : ""
              }`}
            >
              <div 
                className="flex items-center flex-grow"
                onClick={() => handleCommunitySelect(community)}
              >
                <img
                  src={community.banner}
                  alt={community.name}
                  className="w-10 h-10 rounded-full mr-2 md:mr-4"
                />
                <span className="text-gray-700 text-xs md:text-base">
                  {community.name}
                </span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleUpdateCommunity(community)}
                  className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600"
                  title="Edit community"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>
                <button 
                  onClick={() => handleDeleteCommunity(community)}
                  className="bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  title="Delete community"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right column */}
      <div className="flex flex-col w-full bg-white rounded-md px-5 py-5 border-l">
        {isChangingCommunity ? (
          <div className="flex justify-center items-center h-screen">
            <span className="admin-loader"></span>
          </div>
        ) : selectedCommunityData ? (
          <>
            <h1 className="font-bold text-lg border-b border-black pb-1 mb-2">
              {selectedCommunityData.name}
            </h1>

            {isUpdating && (
              <div className="bg-green-100 text-green-800 p-2 mb-4 rounded">
                Updating...
              </div>
            )}
            <span className="text-sm">
              Total Moderators: {selectedCommunityData.moderatorCount}
            </span>
            <span className="text-sm">
              Total Members: {selectedCommunityData.memberCount}
            </span>

            <div className="flex flex-col md:flex-row gap-5">
              {/* Moderators list */}
              <div className="flex flex-col gap-2 w-full md:w-1/2">
                <h2 className="font-medium mb-2">Moderators</h2>
                {selectedCommunityData.moderators?.length === 0 && (
                  <span>No moderators</span>
                )}
                <div className="flex flex-col">
                  {selectedCommunityData.moderators?.map((moderator) => (
                    <div
                      key={moderator._id}
                      className={`p-2 cursor-pointer border flex flex-col md:flex-row gap-2 justify-between items-center rounded ${
                        selectedModerator?._id === moderator._id ? "" : ""
                      }`}
                      onClick={() => handleModeratorSelect(moderator)}
                    >
                      <span className="font-medium">{moderator.name}</span>
                      <button
                        disabled={isUpdating}
                        className={` bg-red-500 px-4 py-1 text-sm  text-white rounded hover:bg-red-700 ${
                          isUpdating ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                        onClick={() => handleRemoveModerator(moderator)}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add moderator form */}
              <div className="flex flex-col w-full gap-2 md:w-1/2">
                <h2 className="font-medium mb-2">Add Moderator</h2>
                <div className="flex flex-col gap-2 md:flex-row">
                  <select
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded focus:ring-purple-500 focus:border-purple-500 block w-full p-2.5 "
                    value={newModerator}
                    onChange={(e) => setNewModerator(e.target.value)}
                  >
                    <option value="">Select a moderator</option>
                    {moderators?.map((moderator) => (
                      <option key={moderator._id} value={moderator._id}>
                        {moderator.name}
                      </option>
                    ))}
                  </select>
                  <button
                    disabled={
                      !newModerator ||
                      isUpdating ||
                      selectedCommunityData.moderators?.find(
                        (moderator) => moderator._id === newModerator
                      )
                    }
                    className={`p-2 bg-purple-500 text-white rounded hover:bg-purple-700 ${
                      !newModerator ||
                      isUpdating ||
                      selectedCommunityData.moderators?.find(
                        (moderator) => moderator._id === newModerator
                      )
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                    onClick={handleAddModerator}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <span className="font-medium text-gray-400">
              Select a community to view details
            </span>
          </div>
        )}
      </div>

      {/* Add Community Modal */}
      {showAddCommunityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
            <h2 className="text-xl font-bold mb-4">Add New Community</h2>
            
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={communityForm.name}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Community Name"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={communityForm.description}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Community Description"
                rows="3"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Banner URL
              </label>
              <input
                type="text"
                name="banner"
                value={communityForm.banner}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                placeholder="Banner Image URL (optional)"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowAddCommunityModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunity}
                className={`bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded ${
                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isUpdating}
              >
                {isUpdating ? "Creating..." : "Create Community"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Community Modal */}
      {showEditCommunityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
            <h2 className="text-xl font-bold mb-4">Edit Community</h2>
            
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError}
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={communityForm.name}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={communityForm.description}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="3"
              ></textarea>
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Banner URL
              </label>
              <input
                type="text"
                name="banner"
                value={communityForm.banner}
                onChange={handleInputChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowEditCommunityModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveUpdate}
                className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isUpdating}
              >
                {isUpdating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3">
            <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
            
            <p className="mb-6">
              Are you sure you want to delete the community "{selectedCommunity?.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteConfirmModal(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className={`bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded ${
                  isUpdating ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isUpdating}
              >
                {isUpdating ? "Deleting..." : "Delete Community"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommunityManagement;
