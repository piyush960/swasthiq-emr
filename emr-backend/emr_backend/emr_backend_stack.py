from aws_cdk import (
    Stack,
    Duration,
    RemovalPolicy   ,
    CfnOutput
)
from constructs import Construct

import aws_cdk.aws_ec2 as ec2
import aws_cdk.aws_rds as rds
import aws_cdk.aws_lambda as lambda_
from aws_cdk import CustomResource
import aws_cdk.custom_resources as cr
from aws_cdk.aws_appsync_alpha import (
    GraphqlApi,
    SchemaFile,
    AuthorizationType,
)


class EmrBackendStack(Stack):

    def __init__(self, scope: Construct, construct_id: str, **kwargs):
        super().__init__(scope, construct_id, **kwargs)

        # ---------------- VPC ----------------
        vpc = ec2.Vpc(self, "EmrVpc", max_azs=2)

        # ---------------- Aurora Serverless PostgreSQL ----------------
        cluster = rds.DatabaseCluster(
            self,
            "EmrAuroraV2",
            engine=rds.DatabaseClusterEngine.aurora_postgres(
                version=rds.AuroraPostgresEngineVersion.VER_15_8
            ),
            writer=rds.ClusterInstance.serverless_v2("writer"),
            vpc=vpc,
            default_database_name="emr",
            serverless_v2_min_capacity=0.5,
            serverless_v2_max_capacity=1.0,
            enable_data_api=True,
            removal_policy=RemovalPolicy.DESTROY,
        )

        # ---------------- AppSync API ----------------
        api = GraphqlApi(
            self,
            "EmrApi",
            name="emr-appointments-api",
            schema=SchemaFile.from_asset("graphql/schema.graphql"),
            authorization_config=dict(
                default_authorization=dict(
                    authorization_type=AuthorizationType.API_KEY
                )
            ),
            xray_enabled=True,
        )

        # ---------------- Main Appointment Lambda ----------------
        fn = lambda_.Function(
            self,
            "AppointmentServiceFn",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="appointmentServiceLambda.lambda_handler",
            code=lambda_.Code.from_asset("lambda"),
            timeout=Duration.seconds(30),
            environment={
                "DB_SECRET": cluster.secret.secret_arn,
                "DB_ARN": cluster.cluster_arn
            }
        )

        cluster.grant_data_api_access(fn)
        cluster.secret.grant_read(fn)

        # ---------------- Lambda as AppSync Datasource ----------------
        lambda_ds = api.add_lambda_data_source("LambdaDatasource", fn)

        lambda_ds.create_resolver(
            "GetAppointmentsResolver",
            type_name="Query",
            field_name="getAppointments"
        )

        lambda_ds.create_resolver(
            "CreateAppointmentResolver",
            type_name="Mutation",
            field_name="createAppointment"
        )

        lambda_ds.create_resolver(
            "UpdateAppointmentStatusResolver",
            type_name="Mutation",
            field_name="updateAppointmentStatus"
        )

        lambda_ds.create_resolver(
            "DeleteAppointmentResolver",
            type_name="Mutation",
            field_name="deleteAppointment"
        )

        # ---------------- DB INIT LAMBDA ----------------
        db_init_fn = lambda_.Function(
            self,
            "DbInitFn",
            runtime=lambda_.Runtime.PYTHON_3_12,
            handler="db_init.handler",
            code=lambda_.Code.from_asset("lambda"),
            timeout=Duration.seconds(30),
            environment={
                "DB_SECRET": cluster.secret.secret_arn,
                "DB_ARN": cluster.cluster_arn
            }
        )

        cluster.grant_data_api_access(db_init_fn)
        cluster.secret.grant_read(db_init_fn)

        # ---------------- RUN SQL ON DEPLOY ----------------
        provider = cr.Provider(
            self,
            "DbInitProvider",
            on_event_handler=db_init_fn
        )

        db_init_resource = CustomResource(
            self,
            "DbInitResource",
            service_token=provider.service_token
        )

        provider.node.add_dependency(cluster)
        db_init_resource.node.add_dependency(cluster)

        # ---------------- Outputs ----------------
        self.api_url = api.graphql_url
        self.api_key = api.api_key

        CfnOutput(
            self,
            "EmrApiUrl",
            value=api.graphql_url,
            description="AppSync GraphQL API URL"
        )

        CfnOutput(
            self,
            "EmrApiKey",
            value=api.api_key or "",
            description="AppSync API Key"
        )

        CfnOutput(
            self,
            "Region",
            value=Stack.of(self).region,
            description="AWS Region"
        )
