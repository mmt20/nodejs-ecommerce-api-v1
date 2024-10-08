exports.sanitizeUser = function (user) {
  return {
    _id: user._id,
    username: user.name,
    fullName: user.email,
    role: user.role,
  };
};
