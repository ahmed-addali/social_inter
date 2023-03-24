import * as api from "../api/userAPI";
import * as types from "../constants/userConstants";

export const getUserAction = (id) => async (dispatch) => {
  try {
    const { error, data } = await api.getUser(id);

    if (error) {
      throw new Error(error);
    }

    dispatch({
      type: types.GET_USER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: types.GET_USER_FAIL,
      payload: error.message,
    });
  }
};

export const updateUserAction = (id, formData) => async (dispatch) => {
  try {
    const { error, data } = await api.updateUser(id, formData);

    if (error) {
      throw new Error(error);
    }

    dispatch({
      type: types.GET_USER_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: types.GET_USER_FAIL,
      payload: error.message,
    });
  }
};

export const getPublicUsersAction = () => async (dispatch) => {
  try {
    const { error, data } = await api.getPublicUsers();

    if (error) {
      throw new Error(error);
    }

    dispatch({
      type: types.GET_PUBLIC_USERS_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: types.GET_PUBLIC_USERS_FAIL,
      payload: error.message,
    });
  }
};

export const getPublicUserAction = (id) => async (dispatch) => {
  try {
    const { error, data } = await api.getPublicUser(id);
    if (error) {
      throw new Error(error);
    }
    dispatch({
      type: types.GET_PUBLIC_USER_PROFILE_SUCCESS,
      payload: data,
    });
  } catch (error) {
    dispatch({
      type: types.GET_PUBLIC_USER_PROFILE_FAIL,
      payload: error.message,
    });
  }
};

export const followUserAction = (id) => async (dispatch) => {
  try {
    const { error } = await api.followUser(id);
    if (error) {
      throw new Error(error);
    }
    dispatch({
      type: types.CHANGE_FOLLOW_STATUS_SUCCESS,
      payload: { isFollowing: true },
    });
  } catch (error) {
    dispatch({
      type: types.CHANGE_FOLLOW_STATUS_FAIL,
      payload: error.message,
    });
  }
};

export const unfollowUserAction = (id) => async (dispatch) => {
  try {
    const { error } = await api.unfollowUser(id);
    if (error) {
      throw new Error(error);
    }

    dispatch({
      type: types.CHANGE_FOLLOW_STATUS_SUCCESS,
      payload: { isFollowing: false },
    });
  } catch (error) {
    dispatch({
      type: types.CHANGE_FOLLOW_STATUS_FAIL,
      payload: error.message,
    });
  }
};
