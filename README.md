
# MediInsights — Healthcare Analytics Dashboard

## Project Overview

MediInsights is a healthcare analytics project that explores hospital visit records and presents operational insights through an interactive dashboard.

The project helps users examine department workload, patient visit records, average waiting times, and length of stay.

**Note:** This project uses synthetic demonstration data and does not contain real patient records.

## Objectives

- Analyze hospital visit data using Python and SQL.
- Summarize department-level performance.
- Explore visit records using search and pagination.
- Visualize hospital operational metrics.
- Export department statistics to CSV.

## Technologies Used

- Python
- Pandas
- SQLite
- FastAPI
- React
- JavaScript
- HTML and CSS
- Git and GitHub

## Key Features

### 1. Overview Dashboard
Displays total visits, unique patients, average waiting time, and average length of stay.

### 2. Department Analysis
Compares visit counts, average waiting times, and average length of stay across departments.

### 3. Patient Visit Explorer
Allows users to search and browse visit records with pagination.

### 4. Reports
Displays average waiting time comparisons and provides downloadable department statistics in CSV format.

## Dataset

The project uses 500 synthetic hospital visit records for demonstration and learning purposes.

The dataset includes fields such as:

- Visit ID
- Patient ID
- Visit date
- Department
- Admission type
- Waiting time in minutes
- Length of stay in days
- Visit outcome

## Data Processing

The project uses Python and Pandas to prepare and analyze the dataset. The processed data is stored in an SQLite database and queried through a FastAPI backend.

The React frontend retrieves data from the API and displays it in the dashboard.

## How to Run the Project

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd mediinsights-healthcare-analytics
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Create and activate a virtual environment

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install Python dependencies

```bash
pip install -r requirements.txt
pip install fastapi uvicorn
```

### 4. Prepare the dataset

```bash
python src/clean_analyze.py
```

### 5. Start the backend

Open a terminal in the project root and run:

```bash
python -m uvicorn backend.main:app --reload
```

The API runs at `http://127.0.0.1:8000`.

API documentation is available at `http://127.0.0.1:8000/docs`.

### 6. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL shown in the terminal.

## Future Improvements

- Add more interactive visualizations.
- Add date and department filters.
- Add automated tests.
- Deploy the dashboard online.

## Disclaimer

This project is intended for educational and portfolio purposes only. All healthcare records are synthetic and must not be interpreted as real clinical data.
