from pathlib import Path
import sqlite3
import pandas as pd

ROOT = Path(__file__).resolve().parents[1]
RAW_FILE = ROOT / "data" / "raw" / "hospital_visits.csv"
PROCESSED_DIR = ROOT / "data" / "processed"
DB_FILE = ROOT / "healthcare_analytics.db"

def main():
    PROCESSED_DIR.mkdir(parents=True, exist_ok=True)

    # 1. Load the source data
    df = pd.read_csv(RAW_FILE)
    print(f"Rows loaded: {len(df)}")

    # 2. Standardize column names and remove duplicate visit IDs
    df.columns = [c.strip().lower() for c in df.columns]
    df = df.drop_duplicates(subset=["visit_id"])

    # 3. Convert columns to the correct data types
    df["visit_date"] = pd.to_datetime(df["visit_date"], errors="coerce")
    df["wait_time_minutes"] = pd.to_numeric(df["wait_time_minutes"], errors="coerce")
    df["length_of_stay_days"] = pd.to_numeric(df["length_of_stay_days"], errors="coerce")

    # 4. Handle missing values
    df["department"] = df["department"].fillna("Unknown")
    df["wait_time_minutes"] = df["wait_time_minutes"].fillna(
        df.groupby("department")["wait_time_minutes"].transform("median")
    )
    df["wait_time_minutes"] = df["wait_time_minutes"].fillna(df["wait_time_minutes"].median())
    df["length_of_stay_days"] = df["length_of_stay_days"].fillna(
        df["length_of_stay_days"].median()
    )

    # 5. Remove impossible values
    df = df[df["wait_time_minutes"] >= 0]
    df = df[df["length_of_stay_days"] >= 0]
    df["visit_date"] = df["visit_date"].dt.strftime("%Y-%m-%d")

    # 6. Create a reusable cleaned dataset
    clean_file = PROCESSED_DIR / "hospital_visits_clean.csv"
    df.to_csv(clean_file, index=False)

    # 7. Create summary tables for validation and quick analysis
    dept_summary = (
        df.groupby("department", as_index=False)
          .agg(
              total_visits=("visit_id", "count"),
              avg_wait_minutes=("wait_time_minutes", "mean"),
              avg_length_of_stay_days=("length_of_stay_days", "mean")
          )
          .round(2)
    )
    dept_summary.to_csv(PROCESSED_DIR / "department_summary.csv", index=False)

    # 8. Load cleaned data into a local SQLite database for SQL analysis
    with sqlite3.connect(DB_FILE) as conn:
        df.to_sql("hospital_visits", conn, if_exists="replace", index=False)

    print(f"Cleaned data saved to: {clean_file}")
    print(f"SQLite database saved to: {DB_FILE}")
    print("\nDepartment summary:")
    print(dept_summary.to_string(index=False))

if __name__ == "__main__":
    main()
