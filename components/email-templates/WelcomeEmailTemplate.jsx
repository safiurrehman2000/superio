/**
 * Welcome Email Template Component
 * This component provides the structure for welcome emails
 * Note: This is primarily for reference for server-rendered email templates
 */

const WelcomeEmailTemplate = ({ userType = 'User', userName = 'User' }) => {
  const isCandidate = userType === 'Candidate';
  const normalizedUserType = String(userType || '').toLowerCase();
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
      {/* Header */}
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

      {/* Content */}
      <div
        style={{
          backgroundColor: 'white',
          padding: '30px',
          borderRadius: '0 0 8px 8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h2 style={{ color: '#333', marginTop: 0 }}>
          {isCandidate ? 'Beste Kandidaat' : 'Beste Werkgever'}
          {userName ? ` ${userName}` : ''},{' '}
        </h2>

        {!isCandidate && (
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
            Bedankt voor uw registratie bij De Flexijobber. Wij helpen u graag
            bij het vinden van gemotiveerde versterking voor uw team.
          </p>
        )}

        {isCandidate ? (
          <div>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              Welkom bij de community! Vanaf nu is het vinden van de perfecte
              flexijob of studentenjob makkelijker dan ooit. Jouw profiel staat
              klaar, dus je kunt direct aan de slag:
            </p>
            <ul style={{ color: '#666', lineHeight: '1.8', fontSize: '16px' }}>
              <li>
                <strong>Solliciteer direct:</strong> Bekijk vacatures die bij jou
                passen en reageer met een klik.
              </li>
              <li>
                <strong>Beheer je profiel:</strong> Houd je gegevens up-to-date
                via jouw persoonlijke <strong>dashboard</strong>.
              </li>
              <li>
                <strong>Volg alles op:</strong> In je dashboard zie je precies
                wat de status van je sollicitaties is.
              </li>
            </ul>
          </div>
        ) : (
          <div>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              Wat kunt u nu doen?
            </p>
            <ul style={{ color: '#666', lineHeight: '1.8', fontSize: '16px' }}>
              <li>
                <strong>Plaats een vacature:</strong> Trek direct de aandacht
                van actieve flexijobbers.
              </li>
              <li>
                <strong>Uw dashboard:</strong> Beheer uw vacatures en volg
                binnengekomen sollicitaties eenvoudig op een centrale plek.
              </li>
            </ul>
            <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
              Heeft u hulp nodig bij het opstarten? Wij kijken mee via uw
              account om alles vlot te laten verlopen.
            </p>
          </div>
        )}

        <div
          style={{
            backgroundColor: '#f8f9fa',
            padding: '20px',
            borderRadius: '6px',
            margin: '20px 0',
          }}
        >
          <h3 style={{ color: '#333', marginTop: 0 }}>Hulp nodig?</h3>
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '16px' }}>
            Gebruik de WhatsApp-knop voor onmiddellijk contact op al je vragen.
          </p>
        </div>

        <div style={{ textAlign: 'center', margin: '30px 0' }}>
          <a
            href='https://flexijobber.com/dashboard'
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
          {isCandidate
            ? 'Veel succes met je zoektocht!'
            : 'Met vriendelijke groet,'}
          <br />
          Team De Flexijobber
        </p>

        {isCandidate && (
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
            <br />
            WhatsApp 0491 100 143 of via de chat: Algemene vragen
            <br />
            Automatisch vacature plaatsen werkgevers via de chat: Direct
            vacature plaatsen
            <br />
            Contactformulier via de website.
          </p>
        )}

        {!isCandidate && normalizedUserType !== 'employer' && (
          <p style={{ color: '#666', lineHeight: '1.6', fontSize: '14px' }}>
            Je accounttype is ingesteld als <strong>{userType}</strong>. De
            standaard werkgeversversie van dit welkomstbericht wordt getoond.
          </p>
        )}
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '20px',
          color: '#999',
          fontSize: '14px',
        }}
      >
        <p style={{ margin: 0 }}>© 2024 Flexijobber. All rights reserved.</p>
        <p style={{ margin: '5px 0 0 0' }}>
          <a
            href='https://flexijobber.com/unsubscribe'
            style={{ color: '#999' }}
          >
            Unsubscribe
          </a>
          {' | '}
          <a href='https://flexijobber.com/privacy' style={{ color: '#999' }}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default WelcomeEmailTemplate;
