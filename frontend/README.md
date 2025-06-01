# Student Management System - Frontend

This project is a student management system frontend built with Angular. It provides a comprehensive interface for managing students, professors, groups, subjects, and payments.

## Features

- User authentication and authorization
- Dashboard for different user roles
- Student management
- Professor management
- Group management
- Subject management
- Payment tracking and management
- PDF generation for reports

## Prerequisites

- Node.js (v14.x or higher)
- npm (v6.x or higher)
- Angular CLI (v13.x or higher)

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/abdelhak-zaaim/student-management.git
   cd student-management/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Configuration

### Frontend Configuration

1. Configure environment variables:

   Open `src/environments/environment.ts` for development and `src/environments/environment.prod.ts` for production, and set the appropriate API URL:
   
   ```typescript
   export const environment = {
     production: false, // Change to true for production
     apiUrl: 'http://localhost:8080/api', // Replace with your backend API URL
   };
   ```

### Backend Configuration

This section outlines how to configure the backend to work with this frontend:

1. Install backend requirements:
   - Java 11 or higher
   - Maven or Gradle
   - MySQL/PostgreSQL database

2. Clone the backend repository:
   ```bash
   git clone https://github.com/abdelhak-zaaim/student-management.git
   cd student-management/backend
   ```

3. Configure the database connection in the backend's application properties.

4. Run the backend server:
   ```bash
   # If using Maven
   mvn spring-boot:run
   
   # If using Gradle
   gradle bootRun
   ```

## Development Server

Run the following command for a development server:

```bash
ng serve
```

Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Build

Run the following command to build the project:

```bash
ng build
```

For production build:

```bash
ng build --configuration production
```

Build artifacts will be stored in the `dist/` directory.

## Project Structure

- `src/app/components/` - Contains all feature components
  - `admin/` - Admin management
  - `auth/` - Authentication components
  - `dashboard/` - Dashboard components for different user roles
  - `group/` - Group management
  - `payment/` - Payment management
  - `professor/` - Professor management
  - `student/` - Student management
  - `subject/` - Subject management
- `src/app/core/` - Core functionality
- `src/app/models/` - Data models
- `src/app/services/` - Services for API communication
- `src/app/shared/` - Shared components and utilities
- `src/app/layout/` - Layout components

## Running Tests

Run the following command to execute the unit tests via [Karma](https://karma-runner.github.io):

```bash
ng test
```

For end-to-end tests:

```bash
ng e2e
```

## Deployment

To deploy the application:

1. Build the application for production:
   ```bash
   ng build --configuration production
   ```

2. Deploy the contents of the `dist/` directory to your web server.

## Further Help

To get more help on the Angular CLI use:
```bash
ng help
```

Or refer to the [Angular CLI Overview and Command Reference](https://angular.io/cli).
