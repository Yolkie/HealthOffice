-- Enable UUID extension for generating IDs
create extension if not exists "uuid-ossp";

-- Create Submission table
create table "Submission" (
  "id" uuid primary key default uuid_generate_v4(),
  "reporterName" text not null,
  "branchName" text not null,
  "dateStarted" timestamptz not null,
  "dateEnded" timestamptz not null,
  "submissionDate" timestamptz not null,
  "additionalComments" text,
  "metadata" text,
  "createdAt" timestamptz default now()
);

-- Create PropertyReport table
create table "PropertyReport" (
  "id" uuid primary key default uuid_generate_v4(),
  "submissionId" uuid not null references "Submission"("id") on delete cascade,
  "propertyId" text not null,
  "propertyName" text not null,
  "condition" text not null,
  "comments" text,
  "photosJson" text not null
);

-- Create indexes for better performance
create index "Submission_reporterName_idx" on "Submission"("reporterName");
create index "Submission_submissionDate_idx" on "Submission"("submissionDate");
create index "PropertyReport_submissionId_idx" on "PropertyReport"("submissionId");
