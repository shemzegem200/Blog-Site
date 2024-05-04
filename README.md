Blog-Site

Welcome to Blog-Site, a full-stack MERN (MongoDB, Express.js, React.js, Node.js) application where users can create, view, edit, and delete blog posts. This project incorporates various features including JSON Web Token (JWT) authentication, rich text editor powered by React Quill, password encryption using bcrypt, and session management by storing tokens in cookies.
Features:

    User Authentication: Users can register for an account or log in if they already have one.
    Post Viewing: Visitors can view all the posts on the home page.
    Post Management: Authenticated users can create, edit, or delete their own posts.

Technologies Used:

    MongoDB: Database to store user information and blog posts.
    Express.js: Backend framework for routing and handling HTTP requests.
    React.js: Frontend library for building user interfaces.
    Node.js: JavaScript runtime environment for server-side development.
    JSON Web Token (JWT): Used for user authentication and authorization.
    React Quill: Rich text editor for creating and editing blog posts.
    bcrypt: Library for password hashing and encryption.
    Cookies: Utilized for session management by storing tokens.

FOLDERS:

- api: for backend REST API endpoints. Node, Express and MongoDB used
      - models: Schemas for mongoose databases
          - Post.js
          - User.js
      - uploads: folder with all images uploaded in the posts
      - index.js: all routes and database connection backend occurs here
  
- blog-site: for entore frontend application in React
      - src: contains all source code
          - pages: folder contains all the individual pages
              - CreatePost.js
              - EditPost.js
              - IndexPage.js
              - LoginPage.js
              - PostDeleteButton.js
              - PostPage.js
              - RegisterPage.js
        - App.js
        - App.css
        - Header.js
        - Layout.js
        - Post.js
        - UserContext.js
        - index.js
