import mongoose from 'mongoose';
import { User } from '../models/User';
import { Paper } from '../models/Paper';
import { Review } from '../models/Review';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/szteunipress';

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Paper.deleteMany({});
    await Review.deleteMany({});
    console.log('Cleared existing data');

    // Create authors
    const authors = await User.create([
      {
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
        password: 'password123',
        userType: 'author',
        institution: 'University of Technology',
        department: 'Computer Science',
        expertise: ['computer-science'],
        isVerified: true
      },
      {
        firstName: 'Emma',
        lastName: 'Johnson',
        email: 'emma.johnson@example.com',
        password: 'password123',
        userType: 'author',
        institution: 'Tech Institute',
        department: 'Computer Science',
        expertise: ['computer-science'],
        isVerified: true
      },
      {
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@example.com',
        password: 'password123',
        userType: 'author',
        institution: 'State University',
        department: 'Computer Science',
        expertise: ['computer-science'],
        isVerified: true
      }
    ]);
    console.log('Created authors');

    // Create reviewers
    const reviewers = await User.create([
      {
        firstName: 'Sarah',
        lastName: 'Wilson',
        email: 'sarah.wilson@example.com',
        password: 'password123',
        userType: 'reviewer',
        institution: 'Research University',
        department: 'Computer Science',
        expertise: ['computer-science'],
        isVerified: true
      },
      {
        firstName: 'David',
        lastName: 'Miller',
        email: 'david.miller@example.com',
        password: 'password123',
        userType: 'reviewer',
        institution: 'Tech University',
        department: 'Computer Science',
        expertise: ['computer-science'],
        isVerified: true
      },
      {
        firstName: 'Lisa',
        lastName: 'Davis',
        email: 'lisa.davis@example.com',
        password: 'password123',
        userType: 'reviewer',
        institution: 'Science Institute',
        department: 'Computer Science',
        expertise: ['computer-science'],
        isVerified: true
      }
    ]);
    console.log('Created reviewers');

    // Create editors
    const editors = await User.create([
      {
        firstName: 'James',
        lastName: 'Wilson',
        email: 'james.wilson@example.com',
        password: 'password123',
        userType: 'editor',
        institution: 'Editorial University',
        department: 'Computer Science',
        expertise: ['computer-science'],
        isVerified: true
      },
      {
        firstName: 'Patricia',
        lastName: 'Taylor',
        email: 'patricia.taylor@example.com',
        password: 'password123',
        userType: 'editor',
        institution: 'Publishing Institute',
        department: 'Computer Science',
        expertise: ['computer-science'],
        isVerified: true
      },
      {
        firstName: 'Robert',
        lastName: 'Anderson',
        email: 'robert.anderson@example.com',
        password: 'password123',
        userType: 'editor',
        institution: 'Review University',
        department: 'Computer Science',
        expertise: ['computer-science'],
        isVerified: true
      }
    ]);
    console.log('Created editors');

    // Create papers
    const papers = await Paper.create([
      {
        title: 'Advanced Machine Learning Techniques',
        authors: ['John Smith'],
        field: 'computer-science',
        abstract: 'This paper presents novel machine learning techniques for improved accuracy in classification tasks.',
        keywords: ['machine learning', 'AI', 'classification'],
        status: 'submitted',
        submittedBy: authors[0]._id,
        author: authors[0]._id,
        reviewers: [],
        reviews: []
      },
      {
        title: 'Blockchain Security Analysis',
        authors: ['Emma Johnson'],
        field: 'computer-science',
        abstract: 'A comprehensive analysis of security vulnerabilities in blockchain systems.',
        keywords: ['blockchain', 'security', 'cryptography'],
        status: 'submitted',
        submittedBy: authors[1]._id,
        author: authors[1]._id,
        reviewers: [],
        reviews: []
      },
      {
        title: 'Cloud Computing Optimization',
        authors: ['Michael Brown'],
        field: 'computer-science',
        abstract: 'Novel approaches to optimize resource allocation in cloud computing environments.',
        keywords: ['cloud computing', 'optimization', 'resource allocation'],
        status: 'under_review',
        submittedBy: authors[2]._id,
        author: authors[2]._id,
        reviewers: [reviewers[0]._id, reviewers[1]._id],
        reviews: []
      }
    ]);
    console.log('Created papers');

    // Create reviews for the third paper
    const reviews = await Review.create([
      {
        paper: papers[2]._id,
        reviewer: reviewers[0]._id,
        decision: 'accept',
        technicalMerit: 5,
        novelty: 4,
        clarity: 5,
        significance: 4,
        publicComments: 'Excellent paper with strong technical contribution.',
        privateComments: 'Highly recommend acceptance.',
        submittedAt: new Date(),
        lastModifiedAt: new Date()
      },
      {
        paper: papers[2]._id,
        reviewer: reviewers[1]._id,
        decision: 'accept',
        technicalMerit: 4,
        novelty: 5,
        clarity: 4,
        significance: 5,
        publicComments: 'Very innovative approach with significant impact.',
        privateComments: 'Strong recommendation for acceptance.',
        submittedAt: new Date(),
        lastModifiedAt: new Date()
      }
    ]);
    console.log('Created reviews');

    // Update the paper with the review IDs
    await Paper.findByIdAndUpdate(papers[2]._id, {
      $push: { reviews: { $each: reviews.map(r => r._id) } }
    });
    console.log('Updated paper with review IDs');

    console.log('Database seeded successfully!');
    console.log('\nTest accounts:');
    console.log('Authors:');
    authors.forEach(a => console.log(`- ${a.email} (password: password123)`));
    console.log('\nReviewers:');
    reviewers.forEach(r => console.log(`- ${r.email} (password: password123)`));
    console.log('\nEditors:');
    editors.forEach(e => console.log(`- ${e.email} (password: password123)`));

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the seed function
seedDatabase(); 