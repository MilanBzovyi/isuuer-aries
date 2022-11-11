export type AmplifyDependentResourcesAttributes = {
    "storage": {
        "patient": {
            "Name": "string",
            "Arn": "string",
            "StreamArn": "string",
            "PartitionKeyName": "string",
            "PartitionKeyType": "string",
            "Region": "string"
        }
    },
    "function": {
        "patientsFunc": {
            "Name": "string",
            "Arn": "string",
            "Region": "string",
            "LambdaExecutionRole": "string"
        }
    },
    "api": {
        "HealthCheckup": {
            "RootUrl": "string",
            "ApiName": "string",
            "ApiId": "string"
        }
    }
}