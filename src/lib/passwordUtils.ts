import bcrypt from 'bcryptjs';

export const genPassword = (password: string) => {
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt);
  return {
    hash,
    salt,
  };
};

export const validatePassword = (password: string, hash: string) => {
  return bcrypt.compareSync(password, hash);
};
