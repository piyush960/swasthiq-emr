import json
import uuid
import boto3
import os

rds = boto3.client("rds-data")

DB_SECRET = os.environ["DB_SECRET"]
DB_ARN = os.environ["DB_ARN"]
DATABASE = "emr"


def execute(sql, params=[]):
    return rds.execute_statement(
        secretArn=DB_SECRET,
        resourceArn=DB_ARN,
        database=DATABASE,
        sql=sql,
        parameters=params,
        includeResultMetadata=True
    )


def get_appointments(args):
    sql = """
        SELECT 
            id,
            patient_name,
            doctor_name,
            date,
            time,
            duration,
            status,
            mode
        FROM appointments
        WHERE 1=1
    """
    params = []

    if args.get("date"):
        sql += " AND date = :d"
        params.append({"name": "d", "value": {"stringValue": args["date"]}})

    if args.get("status"):
        sql += " AND status = :s"
        params.append({"name": "s", "value": {"stringValue": args["status"]}})

    if args.get("doctorName"):
        sql += " AND doctor_name = :doc"
        params.append({"name": "doc", "value": {"stringValue": args["doctorName"]}})

    result = execute(sql, params)

    def extract(v):
        return list(v.values())[0]

    appointments = []
    for row in result["records"]:
        vals = [extract(v) for v in row]

        appointments.append({
            "id": vals[0],
            "patientName": vals[1],
            "doctorName": vals[2],
            "date": vals[3],
            "time": vals[4],
            "duration": vals[5],
            "status": vals[6],
            "mode": vals[7],
        })

    return appointments


def create_appointment(input):
    appt_id = str(uuid.uuid4())

    sql = """
    INSERT INTO appointments
    (id, patient_name, doctor_name, date, time, duration, status, mode)
    VALUES (CAST(:id AS uuid),:p,:d,:dt,:t,:dur,:s,:m)
    """

    execute(sql, [
        {"name": "id", "value": {"stringValue": appt_id}},
        {"name": "p", "value": {"stringValue": input["patientName"]}},
        {"name": "d", "value": {"stringValue": input["doctorName"]}},
        {"name": "dt", "value": {"stringValue": input["date"]}},
        {"name": "t", "value": {"stringValue": input["time"]}},
        {"name": "dur", "value": {"longValue": input["duration"]}},
        {"name": "s", "value": {"stringValue": input.get("status", "Scheduled")}},
        {"name": "m", "value": {"stringValue": input["mode"]}},
    ])

    input["id"] = appt_id
    return input


def update_status(id, new_status):
    execute(
        "UPDATE appointments SET status = :s WHERE id = CAST(:id AS uuid)",
        [
            {"name": "s", "value": {"stringValue": new_status}},
            {"name": "id", "value": {"stringValue": id}}
        ]
    )

    return {"id": id, "status": new_status}


def delete_appointment(id):
    res = execute(
        "DELETE FROM appointments WHERE id = CAST(:id AS uuid)",
        [{"name": "id", "value": {"stringValue": id}}]
    )
    return res["numberOfRecordsUpdated"] > 0


def lambda_handler(event, context):
    field = event["info"]["fieldName"]

    if field == "getAppointments":
        return get_appointments(event["arguments"])

    if field == "createAppointment":
        return create_appointment(event["arguments"]["input"])

    if field == "updateAppointmentStatus":
        return update_status(
            event["arguments"]["id"],
            event["arguments"]["new_status"]
        )

    if field == "deleteAppointment":
        return delete_appointment(event["arguments"]["id"])

    return {"error": "Unknown operation"}
