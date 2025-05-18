import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    console.log('Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.log('Authentication failed: No token provided');
      return res.status(401).json({
        success: false,
        message: 'No authentication token, access denied'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    console.log('Token format check:', token.length > 0 ? 'Valid length' : 'Empty token');
    
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    console.log('Token verification:', decoded ? 'Successful' : 'Failed');
    
    // Add user info to request
    (req as any).user = {
      id: decoded.userId,
      email: decoded.email,
      userType: decoded.userType
    };
    console.log('User authenticated:', decoded.email);

    next();
  } catch (error) {
    console.error('Authentication error details:', error);
    res.status(401).json({
      success: false,
      message: 'Token is invalid or expired'
    });
  }
}; 