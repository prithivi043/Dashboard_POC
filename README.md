# Dashboard POC

Dashboard POC is a full-stack proof-of-concept application designed to demonstrate a modern, scalable dashboard architecture. The project focuses on clean UI, modular frontend components, and a robust backend API suitable for real-world data-driven dashboards.

## Tech Stack

Frontend

* React
* Tailwind CSS

Backend

* Node.js
* Express.js

Database

* MongoDB (MongoDB Atlas supported)

## Features

* Responsive and modern dashboard UI
* Modular React component architecture
* RESTful API built with Express
* MongoDB integration for persistent data storage
* Environment-based configuration
* Scalable project structure suitable for production expansion

## Project Structure

client/

* src/

  * components/
  * pages/
  * services/
  * utils/
  * App.jsx
* public/

server/

* controllers/
* models/
* routes/
* middleware/
* server.js

.env
README.md

## Getting Started

### Prerequisites

* Node.js (v18 or later recommended)
* MongoDB (local or Atlas)
* Git

### Installation

Clone the repository

git clone [https://github.com/your-username/Dashboard_POC.git](https://github.com/your-username/Dashboard_POC.git)
cd Dashboard_POC

Install dependencies for backend

cd server
npm install

Install dependencies for frontend

cd ../client
npm install

### Environment Variables

Create a .env file in the root or server directory and configure the following values

MONGO_URI=your_mongodb_connection_string
PORT=5000

Do not commit the .env file to version control.

### Running the Application

Start the backend server

cd server
npm run dev

Start the frontend application

cd client
npm run dev

The frontend will run on [http://localhost:5173](http://localhost:5173)
The backend API will run on [http://localhost:5000](http://localhost:5000)

## Usage

* Upload or manage dashboard data through the UI
* Visualize metrics using configurable widgets
* Extend easily with charts, filters, and role-based access

## Future Enhancements

* Authentication and role-based authorization
* Advanced data filtering and analytics
* Chart integrations using libraries like Recharts or Chart.js
* Export and reporting features
* Production deployment with Docker

## Contact

For questions, feedback, or collaboration opportunities:

Email: [prithivigithub043@gmail.com](mailto:prithivigithub043@gmail.com)

## License

This project is provided as a proof of concept and is free to use for learning and development purposes.
