"use client";
import React from "react";
import UsersTable from "./UsersTable";
import JobsTable from "./JobsTable";
import ApplicationsTable from "./ApplicationsTable";
import ActiveSubscriptionsTable from "./ActiveSubscriptionsTable";

export default function Admin({ loading }) {
  return (
    <div style={{ padding: 24 }}>
      <ActiveSubscriptionsTable />
      <UsersTable loading={loading} />
      <JobsTable loading={loading} />
      <ApplicationsTable loading={loading} />
    </div>
  );
}
