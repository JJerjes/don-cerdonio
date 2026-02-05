# Don Cerdonio 🐷 - Roast Pork Delivery
## WDD 330 - Web Frontend Development II
### Final Project Proposal

Don Cerdonio is a web application specialized for a baked duck delivery business. It focuses on offering a ordering experience for customers who don't like to leave home and want to enjoy a delicious dish from the comfort of their home, with a strong emphasis on nutritional transparency and high-quality visual presentation.

- **Trello Board:** [https://trello.com/b/5nN0ZAQs/don-cerdonio-web-project](https://trello.com/b/5nN0ZAQs/don-cerdonio-web-project)

### Key Features
- Nutritional Transparency: Integration with Edamam API to display calories and proteins.
- Dynamic Catalog: Professional food imagery powered by Unsplash API.
- Persistence: LocalStorage integration for shopping cart management.

### Technical Stack
- Tooling: Vite, ESLint, Prettier.
- Languages: HTML5, CSS3 (Mobile-first), JavaScript (ES Modules).
- APIs: Edamam (Nutrition), Unsplash (Images).

### Common Workflow Commands
- `npm run start` - Starts the local development server.
- `npm run build` - Generates the production-ready files in /dist.
- `npm run format` - Automatically formats code using Prettier.
- `npm run lint` - Runs ESLint to check for code quality.


-"Don Cerdonio takes care of you" - Prioritizing health and flavor.

don-cerdonio:
├── node_modules
├── src
    ├── cart
        ├── index.html
        └── checkout.html
    ├── css
        └── style.css
    ├── js
        ├── Alert.mjs
        ├── Cart.mjs
        ├── externalServices.mjs
        ├── main.js
        └── utils.mjs
    ├── public
        ├── images
            ├── .gitkeep
        ├── json
            ├── define.json
        ├── partials
            ├── footer
            └── header
        ├── apple-touch-icon.png 
        ├── favicon-96x96.png
        ├── favicon.ico
        ├── favicon.svg
        └── site.webmanifest
    index.html
├── .editorconfig
├── .eslintrc.json    
├── .gitignore
├── .prettierrc
├── package-lock.json
├── packege.json
├── README.md
└── vite.config.js

pero falta estos archivos:

dist
