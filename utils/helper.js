// generate a token
const generateToken = () => {
  const rand = () => Math.random().toString(36).substr(2);
  return rand() + rand();
};

const resetTokenIsValid = (user, token) =>
  !(
    user &&
    token &&
    token !== user.resetToken &&
    user.resetTokenExpiration < Date.now()
  );

module.exports = {
  generateToken,
  resetTokenIsValid,
};
