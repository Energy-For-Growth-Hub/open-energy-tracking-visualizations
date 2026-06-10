# Donut Chart Template

This template displays the distribution of the population across electricity consumption tiers for a selected country and year.

## Data Source

The chart reads from:

`/data/master_data_file.csv`

The template no longer uses country-specific CSV files.

## How It Works

The chart uses a URL parameter to determine which country to display.

Examples:

* `?country=senegal`
* `?country=benin`

Example URL:

`https://[github-pages-url]/templates/donut/index.html?country=senegal`

## Updating Data

To update the visualization:

1. Update the master data file in `/data/master_data_file.csv`
2. Commit changes to GitHub
3. Wait for GitHub Pages to redeploy

No changes to the chart code are required when adding new countries.

## WordPress Integration

This visualization is embedded in WordPress using an iframe that points to the GitHub Pages URL.

The same template can be reused for any country by changing the `country` URL parameter.
