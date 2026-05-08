"use client";
import React from "react";
import UsersTable from "./UsersTable";
import JobsTable from "./JobsTable";
import ApplicationsTable from "./ApplicationsTable";
import ActiveSubscriptionsTable from "./ActiveSubscriptionsTable";
import ContactQueriesTable from "./ContactQueriesTable";
import InvoicesTable from "./InvoicesTable";

export default function Admin({ loading }) {
  return (
    <div style={{ padding: 24 }}>
      <ActiveSubscriptionsTable />
      <InvoicesTable />
      <ContactQueriesTable />
      <UsersTable loading={loading} />
      <JobsTable loading={loading} />
      <ApplicationsTable loading={loading} />
    </div>
  );
}
