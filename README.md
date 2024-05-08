GatherTown
GatherTown is a community-driven local event finder platform. It helps people discover and participate in local events through advanced search, authentication, and role-based management features. The platform provides comprehensive event management capabilities for organizers and seamless browsing for participants.

Table of Contents
Features
Installation
Configuration
Usage
Directory Structure
API Documentation
Contributing
License
Features
User Authentication: Secure login and registration using bcrypt and JWT.
OAuth Integration: OAuth 2.0 support for Google authentication.
Role-Based Access Control: Fine-grained permissions for different user roles.
Event Management: Create, update, and manage events.
Event Discovery: Advanced search and filter features for discovering local events.
Installation
Clone the repository:
bash
Copy code
git clone https://github.com/equansa00/GatherTown.git
cd GatherTown
Install the dependencies:
bash
Copy code
npm install
Set up the environment configuration by creating a .env file in the project root:
bash
Copy code
touch .env
Add the required environment variables:
Database URI: MONGODB_URI
JWT Secret: JWT_SECRET
Google OAuth Client ID: GOOGLE_CLIENT_ID
Google OAuth Client Secret: GOOGLE_CLIENT_SECRET
Configuration
Ensure your .env file includes all the necessary credentials and configuration for the application to function properly. Example .env file:

plaintext
Copy code
MONGODB_URI=mongodb://localhost/yourdbname
JWT_SECRET=yourjwtsecret
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
Usage
Start the server:
bash
Copy code
npm start
or, for development:
bash
Copy code
npm run dev
The API server will run on http://localhost:5000.
Directory Structure
The main folders and files are organized as follows:

plaintext
Copy code
.
├── config/               # Configuration files
├── controllers/          # Logic for handling API requests
├── helpers/              # Helper functions and utilities
├── middleware/           # Middleware for request handling
├── models/               # MongoDB models (schemas)
├── routes/               # API routes
├── utils/                # Utility functions (e.g., authentication)
├── __test__/             # Tests for the API
├── server.js             # Entry point of the application
├── package.json          # Project metadata and dependencies
└── README.md             # Project documentation
API Documentation
Detailed documentation of the API endpoints, including request/response formats and parameters, can be found in the project's /docs folder or an associated API documentation site.

Contributing
Contributions are welcome! If you wish to contribute, please follow these steps:

Fork the repository.
Create a new feature branch: git checkout -b feature/your-feature.
Commit your changes: git commit -m 'Add your feature'.
Push to your branch: git push origin feature/your-feature.
Create a pull request.
License
GatherTown is released under the MIT License. See LICENSE for more information.
