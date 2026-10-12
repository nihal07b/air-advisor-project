import { useCallback, useEffect, useState } from 'react';
import { getReport } from './api';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

export default function ReportView({ profile }) {
  const [state, setState] = useState({
    loading: true,
    error: '',
    data: null,
  });

  const loadReport = useCallback(async () => {
    setState({
      loading: true,
      error: '',
      data: null,
    });

    try {
      const data = await getReport(
        profile?.profileId,
        profile?.persona,
        profile?.home
      );

      if (!data || !Array.isArray(data.daily) || data.daily.length === 0) {
        throw new Error(
          'No report data is available yet. Please try again later.'
        );
      }

      setState({
        loading: false,
        error: '',
        data,
      });
    } catch (error) {
      setState({
        loading: false,
        error: error.message || 'Unable to load the report.',
        data: null,
      });
    }
  }, [profile]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  if (state.loading) {
    return (
      <section>
        <div className="card" role="status">
          Loading your exposure report...
        </div>

        <p className="note">
          Air-quality estimates are for general guidance only,
          not medical advice.
        </p>
      </section>
    );
  }

  if (state.error) {
    return (
      <section>
        <div className="card">
          <h2>Report unavailable</h2>

          <p className="error" role="alert">
            {state.error}
          </p>

          <button type="button" onClick={loadReport}>
            Try again
          </button>
        </div>

        <p className="note">
          Air-quality estimates are for general guidance only,
          not medical advice.
        </p>
      </section>
    );
  }

  const report = state.data;

  if (
    report.totalExposure == null ||
    report.averageDailyExposure == null ||
    !report.bestDay ||
    !report.worstDay ||
    !Array.isArray(report.insights)
  ) {
    return (
      <section>
        <div className="card">
          <h2>Report unavailable</h2>

          <p>
            The report data is incomplete. Please try again.
          </p>

          <button type="button" onClick={loadReport}>
            Try again
          </button>
        </div>

        <p className="note">
          This report is for general guidance only,
          not medical advice.
        </p>
      </section>
    );
  }

  return (
    <section className="report-view">
      <h2>Your Exposure Report</h2>

      <div className="card">
        <h3>Total exposure</h3>
        <p className="big">{report.totalExposure}</p>
        <p>Sum of the estimated daily exposure values.</p>
      </div>

      <div className="card">
        <h3>Average daily exposure</h3>
        <p className="big">{report.averageDailyExposure}</p>
      </div>

      <div className="card">
        <h3>Best day</h3>
        <p>
          {report.bestDay.date} — exposure {report.bestDay.exposure}
        </p>
      </div>

      <div className="card">
        <h3>Worst day</h3>
        <p>
          {report.worstDay.date} — exposure {report.worstDay.exposure}
        </p>
      </div>

      {report.daily.length > 0 ? (
        <div className="card">
          <h3>Daily exposure</h3>

          <div style={{ width: '100%', height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={report.daily}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="exposure" fill="#64748b" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="card">
          No daily exposure data is available yet.
        </div>
      )}

      <div className="card">
        <h3>Insights</h3>

        {report.insights.length > 0 ? (
          <ul>
            {report.insights.map((insight, index) => (
              <li key={index}>{insight}</li>
            ))}
          </ul>
        ) : (
          <p>No insights are available yet.</p>
        )}
      </div>

      <p className="note">
        This report contains illustrative estimates for demonstration
        purposes. It is not medical advice.
      </p>
    </section>
  );
}