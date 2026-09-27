ResQnet – AI-Powered Rescue Coordination and Simulation
ResQnet is an AI-assisted emergency rescue coordination and simulation platform designed to support faster and more organized disaster response. The system provides a centralized interface for managing emergency scenarios, analyzing incident information, coordinating rescue resources, and displaying response information through an interactive dashboard.

 Setup Requirements

Before running the project, make sure the following software is installed:

 Git
 Bun
Node.js
 Visual Studio Code (recommended)
A modern web browser such as Google Chrome, Microsoft Edge, or Firefox

Recommended Environment

Windows 10/11
Internet connection for installing dependencies
Minimum 4 GB RAM recommended

 Installation

Clone the repository:

```bash
git clone https://github.com/posadivyasree148223/rescue-ai-coordination-ResQnet.git
```

Navigate to the project directory:

```bash
cd rescue-ai-coordination-ResQnet
```

Install the required dependencies:

```bash
bun install
```

## How to Run the Simulation

Start the development server:

```bash
bun run dev
```

After the server starts, the terminal will display a local URL similar to:

```text
http://localhost:5173/
```

Open this URL in a web browser to launch the ResQnet simulation dashboard.

### Simulation Workflow

```text
Start Application
       |
       v
Select / Create Emergency Scenario
       |
       v
Enter Emergency Information
       |
       v
Process Incident Data
       |
       v
Analyze Rescue Resources
       |
       v
Coordinate Response
       |
       v
Display Results on Dashboard
```

To stop the development server:

```text
Ctrl + C
```

## Inputs

The simulation can use the following emergency-related inputs:

| Input              | Description                                                 |
| ------------------ | ----------------------------------------------------------- |
| Emergency Location | Location where the emergency has occurred                   |
| Incident Type      | Type or category of emergency                               |
| Number of People   | Estimated number of people affected or requiring rescue     |
| Severity Level     | Severity or urgency of the incident                         |
| Rescue Teams       | Available rescue teams                                      |
| Resources          | Available vehicles, equipment, and other resources          |
| Team Information   | Information about available rescue personnel                |
| Emergency Status   | Current status of the incident                              |
| Scenario Data      | Data used to create and test different emergency situations |

## Outputs

The system processes the input information and presents results through the dashboard, including:

| Output               | Description                                            |
| -------------------- | ------------------------------------------------------ |
| Incident Status      | Current status of the emergency                        |
| Priority Information | Priority and urgency information for incidents         |
| Rescue Coordination  | Coordination and assignment of rescue resources        |
| Resource Status      | Availability and status of rescue resources            |
| Location Information | Emergency location information                         |
| Alerts               | Important emergency notifications                      |
| Simulation Results   | Results generated from the selected emergency scenario |

## Project Structure

```text
rescue-ai-coordination-ResQnet/
|
├── public/                  # Static assets and publicly accessible files
|
├── src/                     # Main application source code
│   ├── components/          # Reusable UI components
│   ├── pages/               # Application pages
│   └── ...                  # Application and simulation logic
|
├── Project/                 # Project-specific configuration
|
├── node_modules/            # Installed dependencies (generated automatically)
|
├── package.json             # Project dependencies, scripts, and metadata
├── bun.lock                 # Locked dependency versions
├── bunfig.toml              # Bun configuration
├── vite.config.ts           # Vite development/build configuration
├── tsconfig.json            # TypeScript configuration
├── eslint.config.js         # ESLint configuration
├── components.json          # UI component configuration
├── .prettierrc              # Prettier configuration
├── .prettierignore          # Files ignored by Prettier
├── .gitignore               # Files excluded from Git
├── AGENTS.md                # Project development instructions
└── README.md                # Project documentation
```

## File Description

### `src/`

Contains the main application source code, including user-interface components, application pages, simulation logic, and data-processing functionality.

### `public/`

Contains static files and assets used by the application.

### `Project/`

Contains project-specific configuration.

### `package.json`

Defines the project dependencies, scripts, and other project metadata.

### `bun.lock`

Records the dependency versions installed by Bun so that the project can be installed consistently.

### `bunfig.toml`

Contains configuration used by the Bun package manager.

### `vite.config.ts`

Contains configuration for Vite, which is responsible for running the development server and building the application.

### `tsconfig.json`

Contains TypeScript compiler and project configuration.

### `eslint.config.js`

Contains ESLint configuration for maintaining code quality and identifying potential coding issues.

### `components.json`

Contains configuration related to the project's UI component system.

### `.gitignore`

Specifies files and folders that should not be tracked by Git.

### `README.md`

Contains project documentation, installation instructions, simulation instructions, inputs, outputs, and project information.

## Build the Project

To create a production build:

```bash
bun run build
```

To preview the production build:

```bash
bun run preview
```

## Development Commands

Install dependencies:

```bash
bun install
```

Run the simulation:

```bash
bun run dev
```

Build the application:

```bash
bun run build
```

Preview the production build:

```bash
bun run preview
```

## Technology Stack

* React
* TypeScript
* Vite
* Bun
* HTML/CSS
* ESLint
* Prettier

## Objective

The objective of ResQnet is to demonstrate how an AI-assisted emergency coordination platform can help organize emergency information, rescue teams, and available resources within a centralized simulation environment.

The platform can be further extended with real-time GPS tracking, emergency APIs, AI-based route optimization, automatic resource allocation, live alerts, interactive maps, and advanced disaster-response analytics.

## Future Enhancements

* Real-time GPS tracking
* AI-based rescue route optimization
* Automatic rescue-resource allocation
* Real-time emergency alerts
* Interactive disaster maps
* Multi-agency coordination
* Disaster severity prediction
* Historical emergency analytics
* Mobile application support
* Advanced AI-based decision support

---

**ResQnet – AI-Assisted Emergency Rescue Coordination and Simulation Platform**

Available next action: Create a downloadable DOCX file here in this chat containing the editable prose above
