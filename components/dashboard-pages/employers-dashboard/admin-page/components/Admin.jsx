"use client";
import React from "react";
import UsersTable from "./UsersTable";
import JobsTable from "./JobsTable";
import ApplicationsTable from "./ApplicationsTable";

export default function Admin() {
  return (
    <div style={{ padding: 24 }}>
      <UsersTable />
      <JobsTable />
      <ApplicationsTable />
    </div>
  );
}
