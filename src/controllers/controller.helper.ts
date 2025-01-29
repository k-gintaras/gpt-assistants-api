/* eslint-disable @typescript-eslint/no-explicit-any */
import { Response } from 'express';

export const respond = (res: Response, statusCode: number, message: string, data: any = null, error: any = null): Response => {
  let status: 'success' | 'error';

  // Determine success or error status
  if (statusCode >= 200 && statusCode < 300) {
    status = 'success';
  } else {
    status = 'error';
  }

  // Prepare the response structure
  const response = {
    status,
    message,
    data: status === 'success' ? data : undefined, // Include 'data' only for success
    error: status === 'error' ? error : undefined, // Include 'error' only for error responses
  };

  //   // Log the error for debugging purposes if status is error
  //   if (status === 'error' && error) {
  //     console.error('Error: ', error); // Make sure to log the error details
  //   }

  // Return the response with the appropriate status code
  return res.status(statusCode).json(response);
};
