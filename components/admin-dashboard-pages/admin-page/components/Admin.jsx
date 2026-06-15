"use client";
import React from "react";
import UsersTable from "./UsersTable";
import JobsTable from "./JobsTable";
import ApplicationsTable from "./ApplicationsTable";
import ActiveSubscriptionsTable from "./ActiveSubscriptionsTable";
import ContactQueriesTable from "./ContactQueriesTable";
import InvoicesTable from "./InvoicesTable";
import LazyAdminSection from "./LazyAdminSection";

export default function Admin({ loading }) {
  return (
    <div style={{ padding: 24 }}>
      <ActiveSubscriptionsTable />
      <LazyAdminSection minHeight={160}>
        <InvoicesTable />
      </LazyAdminSection>
      <LazyAdminSection minHeight={160}>
        <ContactQueriesTable />
      </LazyAdminSection>
      <LazyAdminSection minHeight={160}>
        <UsersTable loading={loading} />
      </LazyAdminSection>
      <LazyAdminSection minHeight={160}>
        <JobsTable loading={loading} />
      </LazyAdminSection>
      <LazyAdminSection minHeight={160}>
        <ApplicationsTable loading={loading} />
      </LazyAdminSection>
    </div>
  );
}
