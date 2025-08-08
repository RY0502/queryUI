# **App Name**: QueryCraft AI

## Core Features:

- Input Text Box: A prominently displayed text box with a centered label above it that says 'How can I help you today ?'.
- Smart 'Send' Button: An interactive, context-aware 'Send' button. It remains deactivated when the text box is blank, prompting users to input their queries before submission. This helps avoid unnecessary processing and server load.
- API Call: Initiate a POST call to 'https://6894bf8b00245593cabc.fra.appwrite.run/' upon clicking the send button, transmitting the user-input query.
- Screen Disable on POST Call: Disable the screen upon send button click and display a prompt, indicating that results are being generated, which may take a few minutes. Clear any prior response html displayed on the screen. 
- HTML Response Rendering: Rendering of the received HTML response below the query input section.
- Automatic Text Box Clear: Automatic clearing of the input text box on receiving an HTML response from the API, enhancing user experience by preparing the interface for the next query.
- Timeout Mechanism: If the response is not received within 2 minutes the button and screen should return to normal enabled state.

## Style Guidelines:

- Primary color: A calm, deep blue (#3F51B5) to inspire confidence and intelligence.
- Background color: Light grayish-blue (#E8EAF6) to ensure readability and a clean aesthetic.
- Accent color: A vibrant, analogous purple (#7E57C2) for interactive elements like the 'Send' button to draw user attention.
- Body and headline font: 'Inter', a sans-serif, for a modern, machined look that provides great readability.
- Code font: 'Source Code Pro', a monospace font, for code snippets or technical information, for clear distinction and readability.
- Simple, line-based icons for the 'Send' button and other interactive elements, ensuring clarity and ease of understanding.
- Clean, minimal layout with clear divisions between the input, button, and output areas for easy navigation and a seamless user experience.