
import { useEffect, useState } from 'react'
import './App.css'

const API = 'http://127.0.0.1:8000'

function App() {
  const [summary, setSummary] = useState(null)
  const [departments, setDepartments] = useState([])
  const [visits, setVisits] = useState([])
  const [activePage, setActivePage] = useState('Overview')
  const [loading, setLoading] = useState(true)
  const [visitsLoading, setVisitsLoading] = useState(false)
  const [error, setError] = useState('')
  const [visitError, setVisitError] = useState('')
  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [page, setPage] = useState(0)

  const pageSize = 10

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true)
        setError('')

        const [summaryResponse, departmentResponse] =
          await Promise.all([
            fetch(`${API}/api/summary`),
            fetch(`${API}/api/departments`),
          ])

        if (!summaryResponse.ok || !departmentResponse.ok) {
          throw new Error('Unable to load dashboard data.')
        }

        setSummary(await summaryResponse.json())
        setDepartments(await departmentResponse.json())
      } catch (err) {
        setError(
          err.message || 'Could not connect to the backend.'
        )
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [])

  useEffect(() => {
    if (activePage !== 'Patient Visits') return

    let cancelled = false

    async function loadVisits() {
      try {
        setVisitsLoading(true)
        setVisitError('')

        const params = new URLSearchParams({
          search,
          limit: String(pageSize),
          offset: String(page * pageSize),
        })

        const response = await fetch(
          `${API}/api/visits?${params}`
        )

        if (!response.ok) {
          throw new Error('Unable to load patient visits.')
        }

        const data = await response.json()

        if (!cancelled) {
          setVisits(data)
        }
      } catch (err) {
        if (!cancelled) {
          setVisitError(
            err.message || 'Could not load visit records.'
          )
        }
      } finally {
        if (!cancelled) {
          setVisitsLoading(false)
        }
      }
    }

    loadVisits()

    return () => {
      cancelled = true
    }
  }, [activePage, search, page])

  const maxVisits = Math.max(
    1,
    ...departments.map((item) => item.total_visits)
  )

  const maxWait = Math.max(
    1,
    ...departments.map((item) => item.avg_wait_minutes)
  )

  const highestWaitDepartment = departments.reduce(
    (top, item) =>
      item.avg_wait_minutes > (top?.avg_wait_minutes ?? -1)
        ? item
        : top,
    null
  )

  const busiestDepartment = departments.reduce(
    (top, item) =>
      item.total_visits > (top?.total_visits ?? -1)
        ? item
        : top,
    null
  )

  const navigation = [
    { name: 'Overview', icon: '◫' },
    { name: 'Departments', icon: '▦' },
    { name: 'Patient Visits', icon: '♙' },
    { name: 'Reports', icon: '▤' },
  ]

  function handleSearch(event) {
    event.preventDefault()
    setPage(0)
    setSearch(searchInput.trim())
  }

  function changePage(nextPage) {
    if (nextPage < 0 || visits.length < pageSize) return
    setPage(nextPage)
  }

  function downloadDepartmentsCSV() {
    const headers = [
      'Department',
      'Total Visits',
      'Average Wait (Minutes)',
      'Average Stay (Days)',
    ]

    const escapeCSV = (value) =>
      `"${String(value ?? '').replace(/"/g, '""')}"`

    const rows = departments.map((department) => [
      department.department,
      department.total_visits,
      department.avg_wait_minutes,
      department.avg_length_of_stay_days,
    ])

    const csvContent = [
      headers.map(escapeCSV).join(','),
      ...rows.map((row) => row.map(escapeCSV).join(',')),
    ].join('\r\n')

    const blob = new Blob(['\uFEFF' + csvContent], {
      type: 'text/csv;charset=utf-8;',
    })

    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')

    link.href = url
    link.download = 'department_report.csv'
    document.body.appendChild(link)
    link.click()
    link.remove()

    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">M+</div>
          <div>
            <h2>MediInsights</h2>
            <span>HEALTH ANALYTICS</span>
          </div>
        </div>

        <p className="nav-label">WORKSPACE</p>

        <nav>
          {navigation.map((item) => (
            <button
              key={item.name}
              className={`nav-item ${
                activePage === item.name ? 'active' : ''
              }`}
              onClick={() => setActivePage(item.name)}
            >
              <span>{item.icon}</span>
              {item.name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="privacy-card">
            <span className="status-dot" />
            <strong>Demo environment</strong>
            <p>Using synthetic healthcare data</p>
          </div>

          <div className="profile">
            <div className="avatar">MI</div>
            <div>
              <strong>Analytics Workspace</strong>
              <p>Portfolio project</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="breadcrumb">
              Workspace / {activePage}
            </p>
            <h1>{activePage}</h1>
          </div>

          <div className="topbar-right">
            <span className="live-status">
              <span className="status-dot" />
              Local API
            </span>
            <div className="date-chip">
              Synthetic demo dataset
            </div>
          </div>
        </header>

        <section className="welcome-row">
          <div>
            <p className="eyebrow">HEALTHCARE INTELLIGENCE</p>

            <h2>
              {activePage === 'Overview'
                ? 'Hospital operations at a glance'
                : activePage === 'Patient Visits'
                  ? 'Explore patient visits'
                  : activePage === 'Departments'
                    ? 'Department performance'
                    : 'Analytics reports'}
            </h2>

            <p className="muted">
              Explore visit records, department workload,
              and operational patterns.
            </p>
          </div>

          <div className="welcome-icon">✳</div>
        </section>

        {error && (
          <div className="error-banner">
            {error} Check that your FastAPI server is running.
          </div>
        )}

        {loading ? (
          <div className="loading-panel">
            Loading healthcare analytics...
          </div>
        ) : (
          <>
            {activePage === 'Overview' && (
              <>
                <section className="kpi-grid">
                  <KpiCard
                    label="Total visits"
                    value={summary?.total_visits ?? '—'}
                    icon="↗"
                    note="Records analyzed"
                  />

                  <KpiCard
                    label="Unique patients"
                    value={summary?.unique_patients ?? '—'}
                    icon="♙"
                    note="Distinct patient IDs"
                  />

                  <KpiCard
                    label="Average waiting"
                    value={
                      summary
                        ? `${summary.average_wait_minutes} min`
                        : '—'
                    }
                    icon="◷"
                    note="Across recorded visits"
                  />

                  <KpiCard
                    label="Average stay"
                    value={
                      summary
                        ? `${summary.average_stay_days} days`
                        : '—'
                    }
                    icon="▤"
                    note="Length of stay"
                  />
                </section>

                <section className="analytics-grid">
                  <article className="panel department-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Visits by department</h3>
                        <p>
                          Compare workload across hospital
                          departments
                        </p>
                      </div>
                      <span className="panel-tag">BY VISITS</span>
                    </div>

                    <div className="bar-chart">
                      {departments.map((department) => (
                        <div
                          className="bar-row"
                          key={department.department}
                        >
                          <span className="bar-label">
                            {department.department}
                          </span>

                          <div className="bar-track">
                            <div
                              className="bar-fill"
                              style={{
                                width: `${
                                  (department.total_visits /
                                    maxVisits) *
                                  100
                                }%`,
                              }}
                            />
                          </div>

                          <strong>
                            {department.total_visits}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="panel insight-panel">
                    <div className="panel-heading">
                      <div>
                        <h3>Key observations</h3>
                        <p>
                          Highlights from the current dataset
                        </p>
                      </div>
                      <span className="insight-symbol">✦</span>
                    </div>

                    {busiestDepartment && (
                      <div className="insight-item">
                        <span className="insight-number">01</span>
                        <div>
                          <strong>
                            {busiestDepartment.department}
                          </strong>
                          <p>
                            Department with the most recorded
                            visits.
                          </p>
                        </div>
                      </div>
                    )}

                    {highestWaitDepartment && (
                      <div className="insight-item">
                        <span className="insight-number">02</span>
                        <div>
                          <strong>
                            {highestWaitDepartment.department}
                          </strong>
                          <p>
                            Department with the highest average
                            waiting time.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="note-box">
                      <strong>Data note</strong>
                      <p>
                        Results describe synthetic practice data
                        and do not represent actual hospital
                        performance.
                      </p>
                    </div>
                  </article>
                </section>
              </>
            )}

            {activePage === 'Departments' && (
              <section className="panel table-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Department performance</h3>
                    <p>
                      Visits, waiting times, and average length
                      of stay
                    </p>
                  </div>
                </div>

                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Total visits</th>
                        <th>Average wait</th>
                        <th>Average stay</th>
                      </tr>
                    </thead>

                    <tbody>
                      {departments.map((department) => (
                        <tr key={department.department}>
                          <td>{department.department}</td>
                          <td>{department.total_visits}</td>
                          <td>
                            {department.avg_wait_minutes} min
                          </td>
                          <td>
                            {department.avg_length_of_stay_days}{' '}
                            days
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {activePage === 'Patient Visits' && (
              <section className="panel table-panel">
                <div className="panel-heading">
                  <div>
                    <h3>Patient visit records</h3>
                    <p>
                      Search by visit ID, patient ID, or
                      department.
                    </p>
                  </div>
                  <span className="panel-tag">
                    VISIT EXPLORER
                  </span>
                </div>

                <form
                  className="search-form"
                  onSubmit={handleSearch}
                >
                  <input
                    type="search"
                    value={searchInput}
                    onChange={(event) =>
                      setSearchInput(event.target.value)
                    }
                    placeholder="Search visit ID, patient ID, department..."
                    aria-label="Search patient visits"
                  />

                  <button
                    type="submit"
                    className="search-button"
                  >
                    Search
                  </button>

                  <button
                    type="button"
                    className="reset-button"
                    onClick={() => {
                      setSearchInput('')
                      setSearch('')
                      setPage(0)
                    }}
                  >
                    Clear
                  </button>
                </form>

                {visitError && (
                  <div className="error-banner">
                    {visitError}
                  </div>
                )}

                {visitsLoading ? (
                  <div className="loading-panel">
                    Loading patient visits...
                  </div>
                ) : (
                  <>
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>Visit ID</th>
                            <th>Patient ID</th>
                            <th>Date</th>
                            <th>Department</th>
                            <th>Admission type</th>
                            <th>Wait (min)</th>
                            <th>Stay (days)</th>
                            <th>Outcome</th>
                          </tr>
                        </thead>

                        <tbody>
                          {visits.map((visit) => (
                            <tr key={visit.visit_id}>
                              <td>{visit.visit_id}</td>
                              <td>{visit.patient_id}</td>
                              <td>{visit.visit_date}</td>
                              <td>{visit.department}</td>
                              <td>{visit.admission_type}</td>
                              <td>{visit.wait_time_minutes}</td>
                              <td>{visit.length_of_stay_days}</td>
                              <td>
                                <span className="outcome-pill">
                                  {visit.visit_outcome}
                                </span>
                              </td>
                            </tr>
                          ))}

                          {visits.length === 0 && (
                            <tr>
                              <td colSpan="8">
                                No visit records found. Try another
                                search.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    <div className="pagination">
                      <span>
                        Page {page + 1} · {visits.length} records
                        shown
                      </span>

                      <div>
                        <button
                          type="button"
                          disabled={page === 0 || visitsLoading}
                          onClick={() => changePage(page - 1)}
                        >
                          Previous
                        </button>

                        <button
                          type="button"
                          disabled={
                            visits.length < pageSize ||
                            visitsLoading
                          }
                          onClick={() => changePage(page + 1)}
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </section>
            )}

            {activePage === 'Reports' && (
              <>
                <section className="kpi-grid">
                  <KpiCard
                    label="Departments analyzed"
                    value={departments.length}
                    icon="▦"
                    note="Departments in dataset"
                  />

                  <KpiCard
                    label="Highest average wait"
                    value={
                      highestWaitDepartment
                        ? `${highestWaitDepartment.avg_wait_minutes} min`
                        : '—'
                    }
                    icon="◷"
                    note={
                      highestWaitDepartment
                        ? highestWaitDepartment.department
                        : 'No data available'
                    }
                  />

                  <KpiCard
                    label="Busiest department"
                    value={
                      busiestDepartment
                        ? busiestDepartment.department
                        : '—'
                    }
                    icon="↗"
                    note={
                      busiestDepartment
                        ? `${busiestDepartment.total_visits} visits`
                        : 'No data available'
                    }
                  />
                </section>

                <section className="panel table-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Average waiting time by department</h3>
                      <p>
                        Compare average waiting times across
                        departments, measured in minutes.
                      </p>
                    </div>

                    <span className="panel-tag">
                      WAIT TIME
                    </span>
                  </div>

                  {departments.length === 0 ? (
                    <p className="muted">
                      No department data is available.
                    </p>
                  ) : (
                    <div className="bar-chart">
                      {[...departments]
                        .sort(
                          (a, b) =>
                            b.avg_wait_minutes -
                            a.avg_wait_minutes
                        )
                        .map((department) => (
                          <div
                            className="bar-row"
                            key={department.department}
                          >
                            <span className="bar-label">
                              {department.department}
                            </span>

                            <div className="bar-track">
                              <div
                                className="bar-fill"
                                style={{
                                  width: `${
                                    (department.avg_wait_minutes /
                                      maxWait) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>

                            <strong>
                              {department.avg_wait_minutes} min
                            </strong>
                          </div>
                        ))}
                    </div>
                  )}
                </section>

                <section className="panel table-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Department report</h3>
                      <p>
                        Export department statistics to use in
                        Excel or other analysis tools.
                      </p>
                    </div>
                  </div>

                  <button
                    className="search-button"
                    onClick={downloadDepartmentsCSV}
                    disabled={departments.length === 0}
                  >
                    Download Department Report CSV
                  </button>

                  {highestWaitDepartment && (
                    <div className="note-box">
                      <strong>Observation from this dataset</strong>
                      <p>
                        {highestWaitDepartment.department} has
                        the highest average waiting time at{' '}
                        {highestWaitDepartment.avg_wait_minutes}{' '}
                        minutes. This is a descriptive finding
                        from synthetic practice data, not a
                        conclusion about a real hospital.
                      </p>
                    </div>
                  )}

                  <p className="muted">
                    This report uses synthetic demonstration data,
                    not real patient records.
                  </p>
                </section>
              </>
            )}
          </>
        )}

        <footer>
          <span>MediInsights · Healthcare Analytics</span>
          <span>Portfolio demo using synthetic data</span>
        </footer>
      </main>
    </div>
  )
}

function KpiCard({ label, value, icon, note }) {
  return (
    <article className="kpi-card">
      <div className="kpi-top">
        <span>{label}</span>
        <span className="kpi-icon">{icon}</span>
      </div>

      <strong className="kpi-value">{value}</strong>
      <p>{note}</p>
    </article>
  )
}

export default App
