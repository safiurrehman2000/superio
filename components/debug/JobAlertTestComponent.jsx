"use client";

import { useState } from "react";
import { useSelector } from "react-redux";
import CircularLoader from "@/components/circular-loading/CircularLoading";
import { errorToast, successToast } from "@/utils/toast";

/**
 * Job Alert Test Component - Use this to test job alert functionality
 * Add this component temporarily to test job alerts
 */
const JobAlertTestComponent = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const selector = useSelector((state) => state.user);

  const triggerJobAlerts = async (testMode = false, userId = null) => {
    setIsLoading(true);
    setResults(null);

    try {
      const response = await fetch("/api/send-job-alerts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          testMode,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResults(data);
        successToast(
          `Job alerts ${
            testMode ? "tested" : "sent"
          } successfully! Check console for details.`
        );
        console.log("Job Alerts Results:", data);
      } else {
        errorToast(data.error || "Failed to trigger job alerts");
      }
    } catch (error) {
      console.error("Error triggering job alerts:", error);
      errorToast("Failed to trigger job alerts");
    } finally {
      setIsLoading(false);
    }
  };

  const triggerForCurrentUser = () => {
    if (!selector?.user?.uid) {
      errorToast("Please log in first");
      return;
    }
    triggerJobAlerts(false, selector.user.uid);
  };

  const testForCurrentUser = () => {
    if (!selector?.user?.uid) {
      errorToast("Please log in first");
      return;
    }
    triggerJobAlerts(true, selector.user.uid);
  };

  return (
    <div className="ls-widget">
      <div className="tabs-box">
        <div className="widget-title">
          <h4>Job Alert Test Component</h4>
          <p className="text-muted">
            Use this component to test job alert functionality. Remove in
            production.
          </p>
        </div>
        <div className="widget-content">
          <div className="row">
            <div className="col-lg-6 col-md-12 col-sm-12">
              <div className="form-group">
                <label>Test Job Alerts (No emails sent)</label>
                <div className="d-flex gap-2">
                  <button
                    className="theme-btn btn-style-one"
                    onClick={() => triggerJobAlerts(true)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <CircularLoader size={16} />
                        Testing...
                      </>
                    ) : (
                      "Test All Users"
                    )}
                  </button>
                  <button
                    className="theme-btn btn-style-two"
                    onClick={testForCurrentUser}
                    disabled={isLoading || !selector?.user?.uid}
                  >
                    Test Current User
                  </button>
                </div>
              </div>
            </div>

            <div className="col-lg-6 col-md-12 col-sm-12">
              <div className="form-group">
                <label>Send Job Alerts (Real emails)</label>
                <div className="d-flex gap-2">
                  <button
                    className="theme-btn btn-style-one"
                    onClick={() => triggerJobAlerts(false)}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <CircularLoader size={16} />
                        Sending...
                      </>
                    ) : (
                      "Send to All Users"
                    )}
                  </button>
                  <button
                    className="theme-btn btn-style-two"
                    onClick={triggerForCurrentUser}
                    disabled={isLoading || !selector?.user?.uid}
                  >
                    Send to Current User
                  </button>
                </div>
              </div>
            </div>
          </div>

          {results && (
            <div className="mt-4">
              <h5>Results:</h5>
              <div className="alert alert-info">
                <strong>Emails Sent:</strong> {results.emailsSent}
                <br />
                <strong>Emails Failed:</strong> {results.emailsFailed}
                <br />
                <strong>Test Mode:</strong> {results.testMode ? "Yes" : "No"}
                <br />
                <strong>Total Results:</strong> {results.results?.length || 0}
              </div>

              {results.results && results.results.length > 0 && (
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Jobs Count</th>
                        <th>Reason</th>
                      </tr>
                    </thead>
                    <tbody>
                      {results.results.map((result, index) => (
                        <tr key={index}>
                          <td>{result.email}</td>
                          <td>
                            <span
                              className={`badge ${
                                result.status === "sent"
                                  ? "bg-success"
                                  : result.status === "failed"
                                  ? "bg-danger"
                                  : "bg-warning"
                              }`}
                            >
                              {result.status}
                            </span>
                          </td>
                          <td>{result.jobsCount || "-"}</td>
                          <td>{result.reason || "-"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          <div className="mt-4">
            <div className="alert alert-warning">
              <strong>Note:</strong> This component is for testing purposes
              only. Remove it from production code.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobAlertTestComponent;
