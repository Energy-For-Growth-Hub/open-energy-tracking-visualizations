# Global Navigation Map

Current status: Prototype.

Files:
- index.html: map container, layout, controls, and styling
- script.js: D3 map rendering, search, zoom, tooltip, and navigation logic
- map_data.csv: country-level values used for map coloring and tooltips
- world.geojson: geographic boundaries used to render the map

Purpose:
Provide a spatial navigation tool that allows users to explore country-level electricity consumption data and navigate directly to country pages.

Key Features:
- Country search
- Zoom and pan controls
- Hover tooltips
- Country highlighting
- Country page navigation
- Tier 4+ population share choropleth

Future goal:
Convert the prototype into the primary navigation interface for Open Energy Tracking. The map should dynamically pull from centralized country data and link directly to country profile pages using standardized country slugs.
