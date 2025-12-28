#!/usr/bin/env python3
import aws_cdk as cdk
from emr_backend.emr_backend_stack import EmrBackendStack

app = cdk.App()
EmrBackendStack(
    app,
    "EmrBackendStack",
)

app.synth()
