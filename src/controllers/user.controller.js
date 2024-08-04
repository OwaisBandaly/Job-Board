import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const options = { httpOnly: true, secure: true };

const genrateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong");
  }
};

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, role } = req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fileds are required");
  }

  if (!role == "jobSeeker" || !role == "employer") {
    throw new ApiError(409, "role should be either jobSeeker or employer");
  }

  const existedUSer = await User.findOne({ $or: [{ email }, { username }] });
  if (existedUSer) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    username,
    email,
    password,
    role,
  });

  const createdUser = await User.findById(user._id);

  if (!createdUser) {
    throw new ApiError(500, "User register failed");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, createdUser, "User Registered!"));
});

const loginUser = asyncHandler(async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    throw new ApiError(400, "Username & Password required!");
  }

  const user = await User.findOne({ username });

  if (!user) {
    throw new ApiError(404, "User not found!");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid user credentials");
  }

  const { accessToken, refreshToken } = await genrateAccessAndRefreshTokens(
    user._id
  );

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        { user: loggedInUser, accessToken },
        "User loggedIn successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: { refreshToken: undefined },
    },
    {
      new: true,
    }
  );

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, `${req.user.username} Logged Out!`));
});

const changePassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    throw new ApiError(400, "All fields are required!");
  }

  const user = await User.findById(req.user?._id);
  const checkOldPass = await user.isPasswordCorrect(oldPassword);

  if (!checkOldPass) {
    throw new ApiError(400, "Invalid Old Password");
  }

  user.password = newPassword;

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res.status(200).json(new ApiResponse(200, req.user, "User fetched"));
});

export {
  registerUser,
  genrateAccessAndRefreshTokens,
  loginUser,
  logoutUser,
  changePassword,
  getCurrentUser,
};
