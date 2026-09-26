# ResQNet: AI Rescue Command

Build a complete, polished, modern college project web application called:
ResQNet
Multi-Agent AI System for Coordinated Disaster Rescue & Dynamic Resource Allocation
This is an academic demonstration project for a Fundamentals of Artificial Intelligence case study. The application must NOT look like a generic CRUD dashboard or a basic student project. It should look like a professional AI-powered emergency response simulation / command center.
The goal is to visually and interactively demonstrate how multiple AI agents cooperate to rescue victims, allocate limited resources, select routes, and dynamically respond to changing disaster conditions.
IMPORTANT:
This is an AI CASE STUDY, so the application must visibly demonstrate the underlying AI concepts and not merely show final outputs.
The project must cover:
Problem domain and problem statement
Multiple interacting agents
PEAS
Environment properties
Agent types
Cooperative multi-agent behavior
Search technique
State-space/search-tree visualization
Sequence of states explored
At least 2 working cases
At least 2 edge cases
Time and space complexity
Comparison with an alternative search technique
Dynamic resource allocation
Results and observations
Use realistic simulation data, but clearly label it as a SIMULATION / ACADEMIC DEMONSTRATION. Do not imply this is a real emergency-response system.
VISUAL DESIGN
Create an extraordinary but clean visual design.
Design direction:
Professional emergency-management command center
Modern AI/SaaS aesthetic
Minimal and sophisticated
Normal professional colors rather than excessive neon
White / very light gray backgrounds for main content
Deep navy / charcoal for navigation
Use restrained red/orange only for danger, critical alerts and disaster zones
Use green for safe/completed states
Use blue for AI/system information
Rounded cards
Subtle shadows
Excellent spacing
Clear typography
Beautiful data visualizations
Smooth micro-animations
Responsive design
Desktop-first but mobile-friendly
Avoid:
Excessive gradients
Overly bright neon colors
Gaming-style UI
Clutter
Huge decorative elements
Generic template appearance
Excessive emojis
The interface should immediately communicate:
"AI agents are coordinating a disaster rescue operation."
Add subtle animations for:
Agent movement
Resource allocation
Rescue status updates
Search exploration
Route calculation
Alert notifications
Simulation progress
APPLICATION STRUCTURE
Create the following pages / sections:
Overview / Command Center
Live Simulation
Multi-Agent Network
Search & Path Planning
Resource Allocation
PEAS & Environment
Working Cases
Edge Cases
Complexity Analysis
Algorithm Comparison
AI Decision Log
About / Case Study
Use a persistent left sidebar navigation.
Sidebar:
RESQNET
AI Disaster Response
Command Center
Live Simulation
Agent Network
Search & Paths
Resource Allocation
PEAS Analysis
Working Cases
Edge Cases
Complexity
Algorithm Comparison
Decision Log
About
At the top right:
Simulation status
Current simulation time
Scenario selector
Reset Simulation button
COMMAND CENTER DASHBOARD
Create a visually impressive dashboard.
Header:
"Disaster Response Command Center"
Subtitle:
"Multi-Agent AI Coordination & Dynamic Resource Allocation"
Top KPI cards:
Active Agents
Victims Detected
Victims Rescued
Resources Available
Critical Zones
Average Rescue Time
Example simulated values:
Active Agents: 6
Victims Detected: 24
Victims Rescued: 17
Resources Available: 68%
Critical Zones: 4
Average Rescue Time: 8.4 min
Add a large "Live Disaster Map" as the central visualization.
Use a grid/map representation showing:
Disaster zones
Roads
Blocked roads
Victims
Rescue agents
Hospitals / safe zones
Resource depots
Agents should have distinct icons:
🚑 Rescue Agent
🚁 Drone Agent
🚒 Fire/Support Agent
📡 Recon Agent
🏥 Medical Agent
📦 Logistics Agent
Do not rely only on emojis. Prefer clean SVG-style icons.
Show animated agent paths.
Below the map, create:
"AI Coordination Status"
Example:
Recon Agent → detected 4 victims in Zone B
Pathfinding Agent → recalculated route due to blocked road
Resource Agent → allocated medical kit to Rescue Team 2
Medical Agent → prioritized critically injured victim
Logistics Agent → redirected supply vehicle
Make the decision feed update dynamically during simulation.
LIVE SIMULATION PAGE
This is the most important page.
Create an interactive disaster simulation.
Scenario selector:
Earthquake
Flood
Urban Fire
Multi-Zone Disaster
Use a simulation grid.
Example grid:
A1 A2 A3 A4 A5 A6 A7 A8
B1 B2 B3 B4 B5 B6 B7 B8
...
Represent states using clean visual elements.
Example:
S = Safe Zone
R = Resource Depot
V = Victim
A = Rescue Agent
X = Blocked
H = Hospital
D = Disaster Zone
Users should be able to:
Start Simulation
Pause
Reset
Increase simulation speed
Change disaster severity
Add blocked roads
Add victims
Change available resources
Simulation should show agents making decisions.
MULTI-AGENT SYSTEM
Create multiple autonomous agents.
Agents:
Reconnaissance Agent
Goal:
Detect victims and identify hazards.
Sensors:
Drone imagery, hazard reports, environment state.
Actions:
Scan zones, identify victims, update map.
Rescue Agent
Goal:
Reach victims and perform rescue.
Sensors:
Map, victim locations, hazard information.
Actions:
Move, rescue, reroute.
Medical Agent
Goal:
Prioritize victims according to severity.
Sensors:
Victim condition and medical resources.
Actions:
Assign medical resources and prioritize treatment.
Logistics Agent
Goal:
Manage and allocate limited resources.
Sensors:
Resource inventory and agent requirements.
Actions:
Allocate supplies, redirect resources.
Path Planning Agent
Goal:
Find efficient safe routes.
Sensors:
Grid/map and blocked paths.
Actions:
Calculate and update routes.
Coordination Agent
Goal:
Coordinate the other agents.
Sensors:
Global simulation state.
Actions:
Resolve conflicts, prioritize tasks and coordinate agents.
Create an "Agent Network" visualization showing these agents connected.
Show:
Agent
Role
Goal
Current Task
Status
Resources
Communication
Example:
Recon Agent | Scanning Zone C | ACTIVE
Rescue Agent 1 | Victim V12 | MOVING
Rescue Agent 2 | Victim V08 | RESCUING
Medical Agent | Critical Case | PRIORITIZING
Logistics Agent | Medical Supplies | ALLOCATING
Path Agent | Route Calculation | COMPUTING
SEARCH TECHNIQUE
Use A* Search as the primary search algorithm.
Clearly explain that A* is being used for path planning because rescue agents must find efficient routes while considering blocked and hazardous cells.
Show:
f(n) = g(n) + h(n)
Where:
g(n) = cost from start
h(n) = heuristic estimate to goal
f(n) = total estimated cost
Create an interactive "Search Visualization".
When the simulation runs, display:
Start node
Goal node
Explored nodes
Current node
Final path
Blocked nodes
Show the sequence of states explored.
Example:
S → A1 → A2 → B2 → B3 → C3 → C4 → D4 → Goal
Animate the search process.
Add a panel:
SEARCH STATISTICS
Nodes Explored: 31
Path Cost: 12
Search Depth: 12
Branching Factor: 4
Execution Steps: 31
Allow the user to click:
"Run A* Search"
Then animate the algorithm.
STATE SPACE / SEARCH TREE
Create a dedicated visualization of the search tree.
Title:
"State-Space Exploration"
Display nodes such as:
Start
├── State A
│ ├── State B
│ └── State C
├── State D
│ ├── State E
│ └── State F
└── State G
Highlight:
Explored states
Unexplored states
Goal state
Optimal path
Add a small explanation:
"The search space represents possible agent movements from the initial state to the rescue destination. A* prioritizes states using f(n)=g(n)+h(n)."
DYNAMIC RESOURCE ALLOCATION
Create a beautiful resource allocation dashboard.
Resources:
Medical Kits
Water
Food
Rescue Equipment
Fuel
Emergency Vehicles
Show resource cards:
Medical Kits
Available: 42
Allocated: 28
Remaining: 14
Water
Available: 120
Allocated: 86
Remaining: 34
Add a visual allocation diagram.
Example:
Victim Severity
↓
Medical Agent
↓
Priority Calculation
↓
Logistics Agent
↓
Resource Allocation
↓
Rescue Agent
Allow the simulation to dynamically change resource levels.
Example:
"Critical victim detected."
AI response:
Medical Agent increases priority
↓
Logistics Agent checks inventory
↓
Resource allocated
↓
Rescue Agent receives updated task
Show this as an animated chain.
PEAS PAGE
Create a dedicated academic section for PEAS.
Title:
"PEAS Framework"
Create four large cards:
PERFORMANCE MEASURE
Number of victims rescued
Rescue time
Path efficiency
Resource utilization
Agent coordination
Safety
ENVIRONMENT
Disaster zones
Roads
Victims
Hospitals
Resource depots
Hazards
Dynamic conditions
ACTUATORS
Agent movement
Victim rescue
Resource allocation
Route selection
Communication
Emergency dispatch
SENSORS
Map data
Victim detection
Hazard detection
Resource inventory
Agent status
Environmental updates
Make this section look academic but visually polished.
ENVIRONMENT PROPERTIES
Create an interactive table/cards for:
Observable:
Partially Observable
Deterministic / Stochastic:
Stochastic
Episodic / Sequential:
Sequential
Static / Dynamic:
Dynamic
Discrete / Continuous:
Primarily Discrete
Single / Multi-Agent:
Multi-Agent
For each property provide:
Classification
Short explanation
Example from ResQNet
Example:
DYNAMIC
"The disaster environment can change while agents are operating. Roads may become blocked, hazards may appear, and resource availability can change."
AGENT TYPE
Explain the agent architecture.
Use:
"Utility-Based / Goal-Oriented Cooperative Multi-Agent System"
Explain that agents:
Have goals
Observe the environment
Make decisions
Coordinate with other agents
Optimize rescue-related outcomes
Create a diagram:
Environment
↓
Sensors
↓
Agent Perception
↓
Decision / Search
↓
Action
↓
Environment Update
↓
Other Agents
Also show cooperation between agents.
WORKING CASES
Create at least 2 fully interactive working cases.
CASE 1:
"Single-Zone Earthquake Rescue"
Scenario:
1 disaster zone
2 rescue agents
5 victims
sufficient resources
one blocked route
Show:
Initial state
Agent decisions
A* search
Resource allocation
Final result
CASE 2:
"Multi-Zone Flood Rescue"
Scenario:
3 disaster zones
multiple victims
limited rescue agents
limited medical resources
changing paths
Show:
Initial state
Agent coordination
Dynamic reallocation
Route changes
Final result
Add:
"Run Case"
After execution show metrics.
EDGE CASES
Create at least 2 interactive edge cases.
EDGE CASE 1:
"Blocked Critical Route"
A critical victim is detected but the shortest path becomes blocked.
Show:
Original route
Blocked route
A* recalculation
New route
Additional cost
EDGE CASE 2:
"Resource Shortage"
More critical victims are detected than available medical resources.
Show:
Demand
Available resources
Priority calculation
Resource allocation
Unserved requests
Explain why the agents make the resulting decisions.
Also add:
"Run Edge Case"
COMPLEXITY ANALYSIS
Create an academic visualization.
For A* Search, display:
Time Complexity:
O(b^d) in the general worst-case discussion
Space Complexity:
O(b^d)
Where:
b = branching factor
d = depth of the solution
Explain that practical performance depends heavily on the heuristic and environment.
Create a graph showing:
Search Space Size
vs
Nodes Explored
Allow users to adjust:
Branching Factor
Search Depth
Then dynamically update the visualization.
Also show:
"As the search space grows, the number of possible states can increase rapidly."
ALGORITHM COMPARISON
Compare A* with Breadth-First Search.
Do NOT simply display a static table.
Create an interactive comparison.
Algorithms:
A*
BFS
Metrics:
Path Quality
Nodes Explored
Use of Heuristic
Memory Requirement
Suitable Environment
Search Behavior
Provide a "Run Both Algorithms" button.
When clicked:
Run A* and BFS on the same map.
Show two visualizations side-by-side.
A*:
Explored nodes
Final path
Cost
BFS:
Explored nodes
Final path
Cost
Use the SAME scenario so students can understand the difference.
Add a conceptual explanation below the comparison.
AI DECISION LOG
Create a live chronological AI decision timeline.
Example:
10:01:02
Recon Agent detected 3 victims.
10:01:04
Coordination Agent assigned Rescue Agent 2.
10:01:06
Path Agent detected blocked road.
10:01:07
A* recalculated route.
10:01:09
Medical Agent classified Victim V03 as Critical.
10:01:11
Logistics Agent allocated medical kit.
10:01:14
Rescue Agent reached victim.
Make this animate during simulation.
DATA VISUALIZATION
Include polished charts:
Victims rescued over time
Resource utilization
Agent workload
Search nodes explored
Rescue time by case
Resource demand vs availability
Use clean professional charts.
SIMULATION ENGINE
Implement actual frontend simulation logic rather than fake buttons.
Create a centralized simulation state.
Example conceptual state:
{
agents,
victims,
resources,
map,
hazards,
currentTime,
simulationStatus,
searchState,
decisions
}
Implement:
Agent movement
Victim detection
Rescue assignment
Resource allocation
A* pathfinding
BFS comparison
Dynamic obstacles
Agent coordination
Simulation reset
Case loading
The algorithms should produce explainable intermediate results.
INTERACTION DESIGN
Every important feature should actually work.
Buttons:
START SIMULATION
PAUSE
RESET
RUN A* SEARCH
RUN BFS
RUN CASE
RUN EDGE CASE
ADD VICTIM
ADD OBSTACLE
ALLOCATE RESOURCE
RECALCULATE ROUTE
Use toast notifications for important events.
Example:
"Path blocked. A* recalculating..."
"Medical resource allocated to Rescue Agent 2."
"Critical victim assigned highest priority."
LANDING / ABOUT SECTION
Create a beautiful introduction:
RESQNET
"Intelligent coordination when every second matters."
Description:
"ResQNet is a multi-agent AI simulation that demonstrates how autonomous agents can cooperate to coordinate disaster rescue operations, perform path planning, and dynamically allocate limited resources in a changing environment."
Include three feature cards:
MULTI-AGENT COORDINATION
Multiple autonomous agents cooperate to achieve shared rescue goals.
INTELLIGENT SEARCH
A* search enables efficient route planning in changing environments.
DYNAMIC RESOURCE ALLOCATION
Limited resources are continuously allocated according to rescue priorities.
Add:
"Academic Simulation — Fundamentals of Artificial Intelligence"
TECHNICAL REQUIREMENTS
Use a modern frontend stack supported by Lovable.
Prefer:
React
TypeScript
Tailwind CSS
shadcn/ui
Lucide icons
Recharts or another suitable charting library
Use reusable components.
Keep the architecture clean.
Suggested structure:
/components
AgentCard
DisasterMap
SearchVisualizer
ResourcePanel
DecisionLog
MetricCard
CaseCard
AlgorithmComparison
/lib
astar
bfs
simulation
resourceAllocation
agentCoordinator
/pages
Dashboard
Simulation
Agents
Search
Resources
PEAS
Cases
Complexity
Comparison
DecisionLog
Keep AI logic separate from UI components.
IMPORTANT ACADEMIC REQUIREMENT
The final project must make it obvious to a professor that this is an AI case study, not just a dashboard.
The professor should be able to click through the application and understand:
What is the problem?
Who are the agents?
What are their goals?
How do agents interact?
What is the PEAS formulation?
What are the environment properties?
What type of agents are being used?
Why is A* selected?
How does A* explore the state space?
What states were explored?
How does resource allocation work?
What happens in normal scenarios?
What happens in edge cases?
What is the complexity?
How does A* compare with BFS?
Do not hide these concepts behind generic UI.
Make the AI reasoning and simulation process visible.
FINAL POLISH
Add:
Smooth page transitions
Hover effects
Tooltips
Empty states
Loading states
Responsive layouts
Consistent iconography
Consistent spacing
Accessible contrast
Professional typography
Subtle animations
Create a cohesive visual language across every page.
The result should feel like a professional AI research prototype / emergency command center that a college student could confidently demonstrate during a viva.
Most importantly:
MAKE IT NEAT.
MAKE IT ATTRACTIVE.
MAKE IT INTERACTIVE.
MAKE THE AI CONCEPTS VISUALLY OBVIOUS.
MAKE THE SIMULATION ACTUALLY WORK.
MAKE IT LOOK LIKE AN EXCELLENT FINAL-YEAR / COLLEGE AI PROJECT, NOT A TEMPLATE.
Before finishing, test every navigation item, button, simulation control, search visualization, case, edge case, and algorithm comparison.
Fix any broken interactions, TypeScript errors, layout issues, and console errors.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://rescue-ai-coordination.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/5e645707-251e-47a4-9602-d770ce9b5a74).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
