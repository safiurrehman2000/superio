/**
 * Welcome Email Template Component
 * Reference layout for Dutch welcome emails (employers & candidates)
 */

const WelcomeEmailTemplate = ({ userType = 'User' }) => {
  const isCandidate = userType === 'Candidate';
  const dashboardHref = isCandidate
    ? 'https://de-flexi-jobber.be/candidates-dashboard/applied-jobs'
    : 'https://de-flexi-jobber.be/employers-dashboard/dashboard';

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
      }}
    >
      <div
        style={{
          backgroundColor: '#1967d2',
          color: 'white',
          padding: '30px 20px',
          textAlign: 'center',
          borderRadius: '8px 8px 0 0',
        }}
      >
        <h1 style={{ margin: 0, fontSize: '28px' }}>
          Welkom bij De Flexijobber!
        </h1>
      </div>

      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        {isCandidate ? (
          <>
            <h2 style={{ color: '#333', marginTop: 0 }}>Beste Kandidaat,</h2>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              Welkom bij de community! Vanaf nu is het vinden van de perfecte
              flexijob of studentenjob makkelijker dan ooit. Jouw profiel staat
              klaar, dus je kunt direct aan de slag:
            </p>
            <ul style={{ color: '#666', lineHeight: '1.8', fontSize: '16px' }}>
              <li>
                <strong>Solliciteer direct:</strong> Bekijk vacatures die bij jou
                passen en reageer met één klik.
              </li>
              <li>
                <strong>Beheer je profiel:</strong> Houd je gegevens up-to-date
                via jouw persoonlijke dashboard.
              </li>
              <li>
                <strong>Volg alles op:</strong> In je dashboard zie je precies
                wat de status van je sollicitaties is.
              </li>
            </ul>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              Gebruik de Whats-app knop voor onmiddellijk contact op al jouw
              vragen!
            </p>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              Veel succes met je zoektocht!
              <br />
              Team De Flexijobber
            </p>
          </>
        ) : (
          <>
            <h2 style={{ color: '#333', marginTop: 0 }}>Beste Werkgever,</h2>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              Bedankt voor uw registratie bij De Flexijobber. Wij helpen u graag
              bij het vinden van gemotiveerde versterking voor uw team.
            </p>
            <p
              style={{
                color: '#666',
                lineHeight: '1.6',
                fontSize: '16px',
                fontWeight: 'bold',
              }}
            >
              Wat kunt u nu doen?
            </p>
            <ul style={{ color: '#666', lineHeight: '1.8', fontSize: '16px' }}>
              <li>
                <strong>Plaats een vacature:</strong> Trek direct de aandacht
                van actieve flexijobbers.
              </li>
              <li>
                <strong>Uw dashboard:</strong> Beheer uw vacatures en volg
                binnengekomen sollicitaties eenvoudig op één centrale plek.
              </li>
            </ul>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              Heeft u hulp nodig bij het opstarten? Wij kijken mee via uw account
              om alles vlot te laten verlopen.
            </p>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              Gebruik de Whats-app knop voor onmiddellijk contact op al jouw
              vragen!
            </p>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              Met vriendelijke groet,
              <br />
              Team De Flexijobber
            </p>
          </>
        )}

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href={dashboardHref}
            style={{
              backgroundColor: '#1967d2',
              color: 'white',
              padding: '12px 30px',
              textDecoration: 'none',
              borderRadius: '6px',
              fontSize: '16px',
              fontWeight: 'bold',
              display: 'inline-block',
            }}
          >
            Ga naar jouw dashboard
          </a>
        </div>

        <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
          <a
            href='mailto:info@de-flexi-jobber.be'
            style={{
              color: '#1967d2',
              fontWeight: 'bold',
              textDecoration: 'underline',
            }}
          >
            info@de-flexi-jobber.be
          </a>
        </p>
        <ul style={{ color: '#666', lineHeight: '1.8', fontSize: '16px' }}>
          <li>WhatsApp 0491 100 143 of via de chat: Algemene vragen?</li>
          <li>
            Automatisch vacature plaatsen werkgevers via de chat: Direct
            vacature plaatsen
          </li>
          <li>Contactformulier via de website.</li>
        </ul>
      </div>

      <p
        style={{
          textAlign: 'center',
          padding: '20px',
          color: '#999',
          fontSize: '14px',
          margin: 0,
        }}
      >
        © {new Date().getFullYear()} De Flexijobber
      </p>
    </div>
  );
};

export default WelcomeEmailTemplate;
