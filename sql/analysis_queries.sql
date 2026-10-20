-- Healthcare Operations & Patient Analytics
-- Run these queries after running: python src/clean_analyze.py
-- The Python script creates healthcare_analytics.db and the hospital_visits table.

-- 1. Total visits
SELECT COUNT(*) AS total_visits
FROM hospital_visits;

-- 2. Visits by department
SELECT department, COUNT(*) AS total_visits
FROM hospital_visits
GROUP BY department
ORDER BY total_visits DESC;

-- 3. Average waiting time by department
SELECT department, ROUND(AVG(wait_time_minutes), 1) AS avg_wait_minutes
FROM hospital_visits
GROUP BY department
ORDER BY avg_wait_minutes DESC;

-- 4. Visit outcomes and percentages
SELECT
    visit_outcome,
    COUNT(*) AS visits,
    ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM hospital_visits), 1) AS percentage
FROM hospital_visits
GROUP BY visit_outcome
ORDER BY visits DESC;

-- 5. Monthly visits
SELECT
    SUBSTR(visit_date, 1, 7) AS visit_month,
    COUNT(*) AS total_visits
FROM hospital_visits
GROUP BY SUBSTR(visit_date, 1, 7)
ORDER BY visit_month;

-- 6. Admission type comparison
SELECT
    admission_type,
    COUNT(*) AS total_visits,
    ROUND(AVG(wait_time_minutes), 1) AS avg_wait_minutes,
    ROUND(AVG(length_of_stay_days), 2) AS avg_stay_days
FROM hospital_visits
GROUP BY admission_type
ORDER BY total_visits DESC;

-- 7. Departments with average waiting time above 35 minutes
SELECT department, ROUND(AVG(wait_time_minutes), 1) AS avg_wait_minutes
FROM hospital_visits
GROUP BY department
HAVING AVG(wait_time_minutes) > 35
ORDER BY avg_wait_minutes DESC;
