# KI-gesteuerter Mathematik-Rechner

This project is a web application that uses artificial intelligence to solve mathematical problems. The frontend is built with Angular, and the backend is built with Node.js and Express. The application interacts with the OpenAI API to provide solutions to mathematical problems entered by the user in a chat-like interface.

## Features

- Chat-like interface for entering mathematical problems
- Uses OpenAI's GPT-3.5-turbo model to solve problems
- Displays structured and readable solutions
- Frontend built with Angular
- Backend built with Node.js and Express

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js and npm installed on your machine
- Angular CLI installed globally
- OpenAI API key

## Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/yourusername/ki-mathematik-rechner.git
    cd ki-mathematik-rechner
    ```

2. Set up the backend:

    ```bash
    cd backend
    npm install
    ```

3. Create a `.env` file in the `backend` directory with your OpenAI API key:

    ```env
    OPENAI_API_KEY=your_openai_api_key_here
    ```

4. Set up the frontend:

    ```bash
    cd ../frontend
    npm install
    ```

## Running the Application

1. Start the backend server:

    ```bash
    cd backend
    node index.js
    ```

2. Start the frontend server:

    ```bash
    cd frontend
    ng serve
    ```

3. Open your browser and navigate to `http://localhost:4200` to use the application.

## Usage

- Enter a mathematical problem in the input box.
- Press the "Senden" button or hit Enter.
- The solution to the problem will be displayed in the chat interface.

## Example Problems

- Solve `3x^2 + 5x - 2 = 0`
- Integrate the function `f(x) = x^2 * sin(x)`
- Differentiate the function `f(x) = 3x^3 + 2x^2 + x`

## Technologies Used

- Angular
- Node.js
- Express
- OpenAI API

## Contributing

To contribute to this project, please follow these steps:

1. Fork this repository.
2. Create a new branch: `git checkout -b feature-branch`.
3. Make your changes and commit them: `git commit -m 'Add new feature'`.
4. Push to the branch: `git push origin feature-branch`.
5. Submit a pull request.

## License

This project is licensed under the MIT License.

## Acknowledgements

- [OpenAI](https://openai.com) for providing the AI model
- [Angular](https://angular.io)
- [Node.js](https://nodejs.org)
- [Express](https://expressjs.com)
