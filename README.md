# NeuraSec Research Group

**Advancing AI Security and Intelligent Systems.**

NeuraSec is an international research group working on cybersecurity, deep learning,
natural language processing and explainable AI.

- Website: **https://neurasec.github.io/NeuraSec/**
- Contact: [neurasec1@gmail.com](mailto:neurasec1@gmail.com)
- LinkedIn: [NeuraSec Research Group](https://www.linkedin.com/company/neurasec-research-group/)

## About this repository

This repository is the group's website. It is a static site (HTML, CSS and JavaScript)
published with GitHub Pages. People, papers and news live in `data/*.js`; the pages are
drawn from them, so keeping the site current means editing those files.

| | |
|---|---|
| `data/` | members, publications, news, partner institutions |
| `images/` | member photos, institution logos, flags |
| `tools/` | validation and build scripts (Python, no dependencies) |
| `.github/workflows/deploy.yml` | checks the data, builds the site and deploys it |

See [HOW-TO-UPDATE.md](HOW-TO-UPDATE.md) for how to add a member, a paper or news, and
how to run the checks locally.
