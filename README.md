# Paper Network Explorer

Academic Paper Network Visualization - Interactive 2D citation network using Semantic Scholar API

![Paper Network Explorer](https://img.shields.io/badge/React-19-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## Overview

Paper Network Explorer is a web application that visualizes academic paper citation networks in an interactive 2D graph. Inspired by [Connected Papers](https://www.connectedpapers.com/), it uses the Semantic Scholar API to access over 200 million papers and their citation relationships.

## Features

- **Paper Search**: Search by title, DOI, ArXiv ID, or Semantic Scholar ID
- **Interactive 2D Network Graph**: Force-directed graph visualization of citation relationships
- **Year-based Color Coding**: Nodes colored from green (older) to blue (newer)
- **Citation-based Node Sizing**: Node size reflects citation count
- **Three-column Layout**: 
  - Left: Related papers list
  - Center: Interactive network graph
  - Right: Selected paper details
- **Dark/Light Theme**: Toggle between themes

## Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, tRPC, Express
- **Graph Visualization**: react-force-graph-2d
- **Routing**: Wouter
- **API**: Semantic Scholar API

## Installation

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build
```

## Usage

1. Enter a paper title, DOI, or Semantic Scholar ID in the search box
2. Click "探索" (Explore) button
3. View the citation network in the center panel
4. Click nodes to view paper details
5. Right-click nodes to navigate to that paper's network

## Project Structure

```
paper-network/
├── client/src/
│   ├── pages/          # Page components
│   ├── components/     # Reusable components
│   ├── contexts/       # React contexts
│   └── App.tsx         # Main app component
├── server/
│   ├── routers.ts      # tRPC routers
│   └── _core/          # Server core
└── shared/
    └── const.ts        # Shared constants
```

## API

This project uses the [Semantic Scholar API](https://api.semanticscholar.org/) to fetch paper data and citation information.

## Screenshots

### Home Page
Search for papers by title, DOI, or Semantic Scholar ID.

### Network Visualization
Interactive 2D graph showing citation relationships with year-based coloring.

## Future Enhancements

- Database integration for search history
- User authentication
- Advanced filtering (year, field, citation count)
- Export functionality (PNG, SVG, JSON)
- Japanese paper support (医中誌Web, J-STAGE, CiNii)

## License

MIT License

## Acknowledgments

- [Semantic Scholar](https://www.semanticscholar.org/) for providing the API
- [Connected Papers](https://www.connectedpapers.com/) for inspiration
- [react-force-graph](https://github.com/vasturiano/react-force-graph) for graph visualization

## Author

Created by [tomiyuta](https://github.com/tomiyuta)

