export default function DecisionCard({ d, persona }) {
  const isSchool = persona === 'school';

  // Choose a colour based on the AQI category
  const getAqiColor = (band) => {
    const category = (band || '').toLowerCase();

    if (category.includes('good') || category.includes('satisfactory')) {
      return 'aqi-good';
    }

    if (category.includes('moderate')) {
      return 'aqi-moderate';
    }

    if (category.includes('poor') && !category.includes('very')) {
      return 'aqi-poor';
    }

    if (category.includes('very poor') || category.includes('severe')) {
      return 'aqi-severe';
    }

    return 'aqi-default';
  };

  const isOutdoorAvoided =
    (d.decision.outdoor || '').toLowerCase() === 'avoid';

  const schoolRemoteAdvice =
    d.decision.remote === 'Recommended'
      ? 'Consider remote learning'
      : 'Normal school day, subject to local guidance';

  return (
    <div className="card">
      <h2>{isSchool ? 'School Day Advisory' : "Today's Air Advice"}</h2>

      <p className={`big ${getAqiColor(d.band)}`}>
        AQI {d.naqi} · {d.band}
      </p>

      {isSchool ? (
        <>
          <ul>
            <li>
              Outdoor activities:{' '}
              <b>{isOutdoorAvoided ? 'No-go' : 'Check local guidance'}</b>
            </li>
            <li>
              Mask / protection: <b>{d.decision.mask}</b>
            </li>
            <li>
              School arrangements: <b>{schoolRemoteAdvice}</b>
            </li>
          </ul>

          <p>
            <b>Guidance for schools:</b> Consider moving outdoor activities
            indoors when air quality is poor. Follow official local advisories
            and school health policies.
          </p>
        </>
      ) : (
        <ul>
          <li>
            Outdoor activities: <b>{d.decision.outdoor}</b>
          </li>
          <li>
            Mask / protection: <b>{d.decision.mask}</b>
          </li>
          <li>
            Remote day: <b>{d.decision.remote}</b>
          </li>
        </ul>
      )}

      <p>Best option saves about {d.exposure.savedPct}% exposure.</p>

      <p className="note">
        Estimates based on forecast data. Not medical advice.
      </p>
    </div>
  );
}