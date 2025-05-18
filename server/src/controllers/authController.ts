import { Request, Response } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import { validationResult } from 'express-validator';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.type === 'field' ? error.path : 'unknown',
          message: error.msg
        }))
      });
    }

    const { 
      email, 
      password, 
      firstName,
      lastName,
      userType,
      institution,
      department,
      title,
      expertise
    } = req.body;

    console.log('Received registration data:', {
      email,
      firstName,
      lastName,
      userType,
      institution,
      department,
      title,
      expertise: expertise ? 'present' : 'not present'
    });

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    // Create new user
    const user = new User({
      email,
      password,
      firstName,
      lastName,
      userType,
      institution,
      department,
      title,
      expertise,
      isVerified: false
    });

    await user.save();

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data and token
    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        institution: user.institution,
        department: user.department,
        title: user.title,
        expertise: user.expertise
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    // Validate request
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Login validation failed:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array().map(error => ({
          field: error.type === 'field' ? error.path : 'unknown',
          message: error.msg
        }))
      });
    }

    const { email, password } = req.body;
    console.log('Login attempt for email:', email);

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      console.log('Login failed: User not found for email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log('Login failed: Invalid password for email:', email);
      return res.status(401).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    console.log('Login successful for user:', email);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, userType: user.userType },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Prepare response
    const response = {
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        userType: user.userType,
        institution: user.institution,
        department: user.department,
        title: user.title,
        expertise: user.expertise
      }
    };

    console.log('Sending login response:', { ...response, token: 'REDACTED' });

    // Return user data and token
    res.json(response);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Server error during login' 
    });
  }
}; 