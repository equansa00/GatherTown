# GatherTown: Your Local Event Hub
Tired of endlessly scrolling through social media, wondering what's happening in your area? GatherTown is your community-driven solution to discover and participate in exciting local events. Whether you're an event organizer or just looking for something fun to do, GatherTown is your one-stop shop for all things local.

# What We Offer
## Your Personalized Event Feed
GatherTown is more than a list of events; it's your curated guide to what's happening around you. Create an account, tell us your interests, and get recommendations for events you'll love.

## Effortless Event Creation (For Organizers)
If you're hosting an event, GatherTown makes it simple. From detailed listings with eye-catching images to managing attendees, we provide the tools for a successful gathering.

## Intuitive Event Discovery
Finding the perfect event is easy. Use our powerful search to filter by category, date, location, and more. Our interactive map gives you a visual overview of events near you.

## Connect with Your Community
GatherTown is about more than just attending events. It's about connecting with others who share your passions. Share your experiences and discover new interests within your local community.

# Ready to Dive In?
## Get the Code
Head over to our GitHub repository and grab the project:

### bash
git clone https://github.com/equansa00/GatherTown.git
cd GatherTown

## Install Dependencies
Run npm install to set up the necessary software.

## Set Up Your Environment
1. Create a .env file in the project's main folder.
2. Fill it in with your:
 - MONGODB_URI (This is where your event data will live.)
 - JWT_SECRET (A secret code for securely handling logins.)

### Let's Get This Party Started
 - For production environment:
#### sql
npm start

 - For development environment:
#### arduino
npm run dev
Open your browser and check out GatherTown at http://localhost:5000!

## Under the Hood
We've organized the codebase to make it developer-friendly:

 - config/: The control center for the app's settings.
 - controllers/: The brains behind handling your interactions and requests.
 - helpers/: Little helpers that make the code more efficient.
 - middleware/: The security guards, making sure everything's safe and sound.
 - models/: The blueprint for how we store event and user data.
 - routes/: The map that tells your requests where to go.
 - utils/: A toolbox of handy functions.
 - test/: A proving ground where we ensure the code works as expected.
 - server.js: The heart of the application – it gets everything running.
 - README.md: You're reading it!

## Awesome Features
 - User Authentication: We take security seriously, using industry-standard methods (bcrypt, JWT) to protect your login information.
 - OAuth Integration: Skip the hassle of creating a new account and log in with Google.
 - Role-Based Access Control: Organizers get the tools they need, while attendees get a smooth browsing experience.
 - Event Management (For Organizers): All the essentials for event organizers in one place.
 - Event Discovery: Finding your next adventure is fun and easy, thanks to our robust search and filtering options.

## More Details for the Tech-Savvy
For detailed API documentation and instructions on contributing to the project, head over to the /docs folder in the repository. We're always looking for people who want to help improve GatherTown!

## License
GatherTown is all about sharing and collaboration, and that's why we're open source under the MIT License. Feel free to use, modify, and share this project, even for commercial purposes.

## Join the Community!
We're excited to have you as part of the GatherTown community. Let's create a more connected, vibrant, and exciting local scene together!

