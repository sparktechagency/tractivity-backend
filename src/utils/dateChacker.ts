import CustomError from "../app/errors";

const isFutureDate = (date: string | Date): boolean => {
  // Parse the provided date
  const providedDate = new Date(date);

  // Check if the provided date is valid
  if (isNaN(providedDate.getTime())) {
    throw new CustomError.BadRequestError("Invalid date format. Please use 'YYYY-MM-DD'.");
  }

  // Get the current date in YYYY-MM-DD format
  const currentDate = new Date();
  const currentDateString = currentDate.toISOString().split('T')[0];

  // Parse currentDateString back into a Date object
  const currentDateOnly = new Date(currentDateString);

  // Compare the dates (ignoring time)
  return providedDate >= currentDateOnly;
};

export default {
  isFutureDate,
};
