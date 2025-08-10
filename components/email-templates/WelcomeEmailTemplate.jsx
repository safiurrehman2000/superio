/**
 * Welcome Email Template Component
 * This component provides the structure for welcome emails
 * Note: This is primarily for reference as EmailJS uses its own templates
 */

const WelcomeEmailTemplate = ({ userType = "User", userName = "User" }) => {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        backgroundColor: "#f9f9f9",
      }}
    >
      {/* Header */}
      <div
        style={{
          backgroundColor: "#1967d2",
          color: "white",
          padding: "30px 20px",
          textAlign: "center",
          borderRadius: "8px 8px 0 0",
        }}
      >
        <h1 style={{ margin: 0, fontSize: "28px" }}>Welcome to Flexijobber!</h1>
      </div>

      {/* Content */}
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "0 0 8px 8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <h2 style={{ color: "#333", marginTop: 0 }}>Hello {userName}!</h2>

        <p style={{ color: "#666", lineHeight: "1.6", fontSize: "16px" }}>
          Welcome to Flexijobber! We're excited to have you join our community
          as a {userType.toLowerCase()}.
        </p>

        {userType === "Candidate" ? (
          <div>
            <p style={{ color: "#666", lineHeight: "1.6", fontSize: "16px" }}>
              As a candidate, you can now:
            </p>
            <ul style={{ color: "#666", lineHeight: "1.8", fontSize: "16px" }}>
              <li>Browse thousands of job opportunities</li>
              <li>Create and manage your professional profile</li>
              <li>Upload your resume and portfolio</li>
              <li>Apply to jobs with just one click</li>
              <li>Set up job alerts for your dream positions</li>
              <li>Track your application status</li>
            </ul>
          </div>
        ) : (
          <div>
            <p style={{ color: "#666", lineHeight: "1.6", fontSize: "16px" }}>
              As an employer, you can now:
            </p>
            <ul style={{ color: "#666", lineHeight: "1.8", fontSize: "16px" }}>
              <li>Post job openings and reach qualified candidates</li>
              <li>Search our talent database</li>
              <li>Manage applications efficiently</li>
              <li>Build your company profile</li>
              <li>Access premium recruitment tools</li>
              <li>Connect with top talent in your industry</li>
            </ul>
          </div>
        )}

        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "20px",
            borderRadius: "6px",
            margin: "20px 0",
          }}
        >
          <h3 style={{ color: "#333", marginTop: 0 }}>Next Steps:</h3>
          <ol style={{ color: "#666", lineHeight: "1.6", fontSize: "16px" }}>
            <li>Complete your profile to stand out</li>
            <li>Explore our platform features</li>
            <li>Connect with our community</li>
            {userType === "Candidate" && (
              <li>Start browsing and applying to jobs</li>
            )}
            {userType === "Employer" && <li>Post your first job opening</li>}
          </ol>
        </div>

        <div style={{ textAlign: "center", margin: "30px 0" }}>
          <a
            href="https://flexijobber.com/dashboard"
            style={{
              backgroundColor: "#1967d2",
              color: "white",
              padding: "12px 30px",
              textDecoration: "none",
              borderRadius: "6px",
              fontSize: "16px",
              fontWeight: "bold",
              display: "inline-block",
            }}
          >
            Get Started Now
          </a>
        </div>

        <p style={{ color: "#666", lineHeight: "1.6", fontSize: "16px" }}>
          If you have any questions or need assistance, don't hesitate to reach
          out to our support team at{" "}
          <a href="mailto:support@flexijobber.com" style={{ color: "#1967d2" }}>
            support@flexijobber.com
          </a>
        </p>

        <p style={{ color: "#666", lineHeight: "1.6", fontSize: "16px" }}>
          Welcome aboard!
          <br />
          The Flexijobber Team
        </p>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: "center",
          padding: "20px",
          color: "#999",
          fontSize: "14px",
        }}
      >
        <p style={{ margin: 0 }}>© 2024 Flexijobber. All rights reserved.</p>
        <p style={{ margin: "5px 0 0 0" }}>
          <a
            href="https://flexijobber.com/unsubscribe"
            style={{ color: "#999" }}
          >
            Unsubscribe
          </a>
          {" | "}
          <a href="https://flexijobber.com/privacy" style={{ color: "#999" }}>
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
};

export default WelcomeEmailTemplate;
