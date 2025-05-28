# Student Management System

A comprehensive web application for managing students, professors, groups, subjects, and payments in an educational institution.

## Project Overview

This Student Management System provides a complete solution for educational institutions to manage their administrative tasks. The system includes:

- User authentication and authorization
- Student management
- Professor management
- Group management
- Subject management
- Payment tracking and processing
- PDF report generation
- Admin dashboard

## Technologies Used

### Frontend
- Angular 14
- PrimeNG UI Library (Sakai template)
- PrimeFlex CSS utility library
- Chart.js for data visualization
- jsPDF for PDF generation

### Backend
- Java/Spring Boot
- Maven for dependency management
- RESTful API architecture

## Prerequisites

- Node.js (v14+) and npm
- Java Development Kit (JDK) 11 or higher
- Maven 3.6+
- MySQL or PostgreSQL database

## Installation and Setup

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies and build the project:
   ```bash
   mvn clean install
   ```

3. Configure the database connection:
   - Open `src/main/resources/application.properties`
   - Update the database URL, username, and password

4. Run the backend server:
   ```bash
   mvn spring-boot:run
   ```
   The backend server will run on http://localhost:8080 by default.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure API endpoint:
   - Open `src/environments/environment.ts`
   - Update the `apiUrl` property to match your backend URL

4. Run the development server:
   ```bash
   npm start
   ```
   The frontend application will be available at http://localhost:4200

## Building for Production

### Backend

```bash
cd backend
mvn clean package
```

The built JAR file will be located in the `target` directory.

### Frontend

```bash
cd frontend
npm run build
```

The production-ready files will be generated in the `dist/sakai-ng` directory.

## Features

- **Authentication**: Secure login and role-based access control
- **Student Management**: Add, edit, view, and delete student records
- **Professor Management**: Manage professor details and assignments
- **Group Management**: Create and manage student groups
- **Subject Management**: Define subjects and associate them with groups and professors
- **Payment Management**: Track student payments and generate reports
- **PDF Generation**: Create downloadable reports in PDF format
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## Theme Customization

This application uses the PrimeNG Sakai template with a default 'saga-orange' light theme. You can change the theme in the application settings or modify the default theme in `src/app/app.component.ts`.

## Project Structure

```
student-management/
├── frontend/          # Angular frontend application
│   ├── src/
│   │   ├── app/       # Application components and modules
│   │   ├── assets/    # Static assets like images and theme files
│   │   └── environments/ # Environment configurations
│   ├── package.json   # Frontend dependencies and scripts
│   └── angular.json   # Angular project configuration
└── backend/           # Spring Boot backend application
    ├── src/           # Java source code
    └── pom.xml        # Maven dependencies and build configuration
```

## License

This project is proprietary software.

## Contact

For support or inquiries, please contact the development team.
