from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import sqlite3
from pathlib import Path

app = FastAPI(title="MediInsights API")

# Allow our React frontend to connect during local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Find the database in the main project folder
PROJECT_ROOT = Path(__file__).resolve().parents[1]
DB_PATH = PROJECT_ROOT / "healthcare_analytics.db"


def get_connection():
    return sqlite3.connect(DB_PATH)


@app.get("/")
def home():
    return {
        "message": "Welcome to MediInsights Healthcare Analytics API"
    }


@app.get("/api/summary")
def get_summary():
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT
                COUNT(*) ,
                COUNT(DISTINCT patient_id),
                ROUND(AVG(wait_time_minutes), 2),
                ROUND(AVG(length_of_stay_days), 2)
            FROM hospital_visits
        """)

        row = cursor.fetchone()

    return {
        "total_visits": row[0],
        "unique_patients": row[1],
        "average_wait_minutes": row[2],
        "average_stay_days": row[3],
    }

@app.get("/api/departments")
def get_departments():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                department,
                COUNT(*) AS total_visits,
                ROUND(AVG(wait_time_minutes), 2) AS avg_wait_minutes,
                ROUND(AVG(length_of_stay_days), 2)
                    AS avg_length_of_stay_days
            FROM hospital_visits
            GROUP BY department
            ORDER BY total_visits DESC
        """)

        rows = cursor.fetchall()

    return [
        {
            "department": row[0],
            "total_visits": row[1],
            "avg_wait_minutes": row[2],
            "avg_length_of_stay_days": row[3],
        }
        for row in rows
    ]

@app.get("/api/visits")
def get_visits(search: str = "", limit: int = 100, offset: int = 0):
    limit = max(1, min(limit, 500))
    offset = max(0, offset)

    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT visit_id, patient_id, visit_date, department,
                   admission_type, wait_time_minutes,
                   length_of_stay_days, visit_outcome
            FROM hospital_visits
            WHERE visit_id LIKE ?
               OR patient_id LIKE ?
               OR department LIKE ?
            ORDER BY visit_date DESC
            LIMIT ? OFFSET ?
        """, (
            f"%{search}%",
            f"%{search}%",
            f"%{search}%",
            limit,
            offset
        ))

        rows = cursor.fetchall()

    columns = [
        "visit_id", "patient_id", "visit_date", "department",
        "admission_type", "wait_time_minutes",
        "length_of_stay_days", "visit_outcome"
    ]

    return [dict(zip(columns, row)) for row in rows]
