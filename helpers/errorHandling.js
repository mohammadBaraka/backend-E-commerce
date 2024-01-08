import { httpStatus } from "../helpers/httpStatus.js";

export const errorHandling = (err, req, res, next) => {
  if (err)
    return res
      .status(httpStatus.cdeIntervar)
      .json({ status: httpStatus.FAIL, message: err.message });
};
