import os
import boto3

rds = boto3.client("rds-data")

DB_SECRET = os.environ["DB_SECRET"]
DB_ARN = os.environ["DB_ARN"]
DATABASE = "emr"

CREATE_TABLE_SQL = """
CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY,
  patient_name VARCHAR(100) NOT NULL,
  doctor_name VARCHAR(100) NOT NULL,
  date VARCHAR(100) NOT NULL,
  time VARCHAR(100) NOT NULL,
  duration INT NOT NULL,
  status VARCHAR(20) NOT NULL,
  mode VARCHAR(20) NOT NULL
);
"""

CREATE_INDEX_SQL = """
CREATE UNIQUE INDEX IF NOT EXISTS unique_slot_idx
ON appointments(doctor_name, date, time);
"""

def handler(event, context):
    rds.execute_statement(
        secretArn=DB_SECRET,
        resourceArn=DB_ARN,
        database=DATABASE,
        sql=CREATE_TABLE_SQL
    )

    rds.execute_statement(
        secretArn=DB_SECRET,
        resourceArn=DB_ARN,
        database=DATABASE,
        sql=CREATE_INDEX_SQL
    )

    return {"status": "ok"}
