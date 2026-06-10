# Slope Chart Template

This template compares electricity consumption tier distributions between two years for a selected country.

The chart displays percentage-point changes across tiers and allows users to select different start and end years.

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

`https://[github-pages-url]/templates/slope/index.html?country=senegal`

## Updating Data

To update the visualization:

1. Update the master data file in `/data/master_data_file.csv`
2. Commit changes to GitHub
3. Wait for GitHub Pages to redeploy

No changes to the chart code are required when adding new countries.

## WordPress Integration

This visualization is embedded in WordPress using an iframe that points to the GitHub Pages URL.

The same template can be reused for any country by changing the `country` URL parameter.

## Notes

If a newly added country does not appear:

1. Confirm the country exists in the master data file.
2. Confirm the `slug` value matches the URL parameter.
3. Confirm GitHub Pages has finished redeploying.
