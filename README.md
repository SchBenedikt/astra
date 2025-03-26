# astra

## Functions and Features

Astra includes the following functions and features:

- **Plugin System**: Integrates various plugins to extend functionality.
- **Live API**: Provides a multimodal live API experience.
- **User Interface**: Offers a user-friendly interface for interacting with different tools and services.
- **Development Server**: Easily start a development server for testing and development.
- **Build System**: Build the project for production with a single command.

## Project Description

Astra is a web-based console application designed to provide a multimodal live API experience. It integrates various plugins to enhance functionality and offers a user-friendly interface for interacting with different tools and services.

## Prerequisites

Before you begin, ensure you have the following software installed:

- Node.js (version 14 or later)
- npm (Node Package Manager) or Yarn
- A modern web browser (e.g., Chrome, Firefox)

## Installation

To install the project, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/SchBenedikt/astra.git
   cd astra
   ```

2. Install the dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

## Usage

### Starting the Development Server

To start the development server, run:
```bash
npm start
# or
yarn start
```
This will start the server and open the application in your default web browser.

### Starting the Project with GitHub Actions

To start the project using GitHub Actions, follow these steps:

1. Ensure you have a GitHub repository set up for your project.
2. Add the provided GitHub Actions workflow file (`.github/workflows/start-project.yml`) to your repository.
3. Push the changes to your GitHub repository.
4. The GitHub Actions workflow will automatically start the project using the `npm run start` command.

### Building the Project

To build the project for production, run:
```bash
npm run build
# or
yarn build
```
The build artifacts will be stored in the `build/` directory.

## Contributing

We welcome contributions to Astra! Please refer to the [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to contribute to the project.
