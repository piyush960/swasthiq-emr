# EMR Backend – Appointment Management Service

This backend powers the Appointment Scheduling and Queue Management feature of the EMR System.  
It is built using **AWS CDK**, **AWS AppSync**, **Lambda (Python)** and **Aurora PostgreSQL Serverless v2**.

---

## Features Implemented
- GraphQL API using AWS AppSync
- Appointment CRUD operations
- Real database storage using Aurora PostgreSQL
- Lambda-based business logic (Python)
- Secure access via AWS Data API
- Auto database table creation on deploy

---

## Architecture Overview
- **AWS CDK Stack**
  - VPC
  - Aurora PostgreSQL Serverless v2 (Data API Enabled)
  - AppSync GraphQL API
  - Lambda Resolver
  - DB Init Lambda executed via Custom Resource

- **Lambda Functions**
  - `appointmentServiceLambda`
    - getAppointments
    - createAppointment
    - updateAppointmentStatus
    - deleteAppointment
  - `db_init`
    - Creates DB schema automatically on deployment

---

## Tech Stack
- Python 3.12
- AWS Lambda
- AWS AppSync (GraphQL)
- Aurora PostgreSQL Serverless v2
- AWS CDK (Infrastructure as Code)

---

## ▶️ Running Backend
1️⃣ Install dependencies  
```bash
pip install -r requirements.txt
```

2️⃣ Bootstrap AWS CDK

```bash
cdk bootstrap
```

3️⃣ Deploy

```bash
cdk deploy --outputs-file cdk-outputs.json
```

---

## Environment / Secrets

No manual secrets required. CDK automatically:

* Creates database
* Generates secret in Secret Manager
* Injects into Lambda
* Grants correct IAM permissions

---

## GraphQL Endpoints Output

After deploy CDK prints:

* GraphQL Endpoint
* API Key
* Region

Use these in your frontend.

---

## Database Schema

Automatically created:

```sql
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY,
  patient_name VARCHAR(100),
  doctor_name VARCHAR(100),
  date VARCHAR(100),
  time VARCHAR(100),
  duration INT,
  status VARCHAR(20),
  mode VARCHAR(20)
);

ALTER TABLE appointments
ADD CONSTRAINT unique_slot UNIQUE (doctor_name, date, time);
```

---

## Notes

* Conflict Prevention handled in DB level
* Backend ensures correct status update
* Matches assignment API contract