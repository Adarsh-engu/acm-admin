# ACM GRIET Admin Dashboard

Welcome to the internal administrative dashboard for the ACM GRIET Student Chapter. This platform serves as the central command center for managing student recruitments, team organization, and chapter operations.

## Overview

The dashboard is designed to streamline the recruitment process by providing a unified, secure space for evaluating and managing applicants. It operates on a multi-tier permission system to ensure that data is routed to the correct reviewers while maintaining global visibility for the core leadership team.

### Multi-Round Evaluation System

The recruitment pipeline is broken down into two primary phases: Round 1 and Round 2. 
Applicants are evaluated based on their domain preferences (1st Priority and 2nd Priority). The system dynamically routes applicants to the respective Domain Leads for review.

### Role-Based Access

**1. Domain Leads**
- **Targeted Reviewing:** Leads only see applicants who have selected their specific domain (e.g., Technical, Brand & Media, Event Management) as a priority.
- **Decision Tracking:** Leads can approve, reject, or mark applicants as pending. Changes can be queued locally and saved in bulk.
- **Round Finalization:** Once a lead has finished evaluating their applicants for a round, they can securely "Finalize" the results using their credentials, locking their decisions and filtering out rejected candidates to keep the workspace clean for the next round.

**2. Core Team & Global Admins**
- **Global Oversight:** Core team members have an unrestricted view of all applicants across all domains. They can track the overarching status of an applicant (e.g., "Pending Review", "Shortlisted", "Rejected") based on the combined decisions of the respective domain leads.
- **Data Export:** Admins can filter data dynamically and export clean, formatted applicant lists to Excel for external processing or university documentation.
- **Team Management:** Admins can onboard new Domain Leads, assign them to specific domains, generate temporary passwords, and reset credentials for existing members.

## Security & Workflow

- **Secure Access:** The platform requires explicit authorization. Unauthenticated access is blocked, and credentials are required to finalize destructive or lock-in actions (like finalizing a recruitment round).
- **Session Management:** Built-in safeguards ensure that only active, verified team members can view sensitive applicant information, such as contact details and university roll numbers.
- **Profile Customization:** Users can manage their own security credentials and view their current role constraints within the system.
