---
id: aws-shared-responsibility
title: The shared responsibility model
summary: AWS secures the cloud; you secure what you put in it
why: "Most AWS security incidents are not AWS being breached. They are customers leaving a bucket public, a key in a repository or a port open, which is on the customer's side of the line."
requires: [aws-regions-azs]
lesson: none
points:
  - title: Of the cloud versus in the cloud
    text: "AWS is responsible for the facilities, hardware, network and virtualisation. You are responsible for your data, identities, configuration and code."
  - title: The line moves with the service
    text: "On EC2 you patch the operating system. On Lambda or DynamoDB, AWS does, and your share shrinks to code, data and permissions."
  - title: Configuration is always yours
    text: "However managed the service, who can access it, whether it is encrypted and whether it is exposed to the internet are your decisions."
quiz_hint: Ask who can change the setting. If you can, it is your responsibility.
quiz:
  - q: An attacker reads data from an S3 bucket whose policy allowed public reads. Whose side of the model failed?
    options: ["AWS's, because S3 is a managed service", "The customer's: access configuration is the customer's responsibility", "Neither; this is expected behaviour"]
    answer: 1
    explain: "AWS ran S3 exactly as configured. New buckets block public access by default; someone on the customer side turned that off or wrote a policy that allowed it."
  - q: Who patches the guest operating system on an EC2 instance?
    options: ["AWS, automatically", "The customer", "Nobody; EC2 images do not need patches"]
    answer: 1
    explain: "AWS is responsible up to the hypervisor. The operating system, its updates and everything installed on it are yours. Tools such as Systems Manager help, but you must use them."
  - q: Which change moves the most responsibility to AWS?
    options: ["Moving from EC2 to larger EC2 instances", "Moving a service from self-managed EC2 to Lambda", "Moving from one Region to another"]
    answer: 1
    explain: "With Lambda, AWS runs and patches the operating system and runtime. You still own the code, its dependencies, its IAM role and the data it touches."
links:
  - { title: "Shared responsibility (AWS Well-Architected security pillar)", url: "https://docs.aws.amazon.com/wellarchitected/latest/security-pillar/shared-responsibility.html" }
  - { title: "Security best practices in IAM (AWS docs)", url: "https://docs.aws.amazon.com/IAM/latest/UserGuide/best-practices.html" }
  - { title: "Blocking public access to your Amazon S3 storage (AWS docs)", url: "https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html" }
---
AWS describes security as shared: AWS is responsible for security **of** the cloud, and the customer for security **in** the cloud. AWS runs the buildings, the servers, the network between them and the virtualisation layer, and gets them audited. Everything you create on top (accounts, users, roles, network rules, operating systems, application code and data) is configured by you, and the outcome is yours.

## Where the line sits

| Service | AWS takes care of | You still own |
| --- | --- | --- |
| EC2 | Hardware, hypervisor, physical network | Guest OS and patches, software, security groups, IAM roles, data, encryption choices |
| RDS | Database engine installation, patching (in your maintenance window), backups if enabled | Network exposure, database users, parameter choices, enabling encryption and Multi-AZ |
| Lambda | OS, runtime patching, scaling | Function code and its dependencies, the execution role, environment secrets, the data |
| S3, DynamoDB | Everything about storage and durability | Bucket and table policies, who may read and write, encryption keys you manage, retention |

The more managed the service, the less you have to patch, but one row never disappears: **identity, network exposure and data**. AWS cannot know whether a bucket is meant to be public or a role is meant to be powerful.

## What usually goes wrong

- **Long-lived access keys** in source code, CI logs or laptops. Prefer roles with temporary credentials for workloads, and single sign-on for people.
- **Public by mistake**: a bucket policy or ACL that grants `"Principal": "*"`, a security group open to `0.0.0.0/0` on a database port, or a snapshot shared publicly. S3 Block Public Access is on by default for new buckets; turning it off should be rare and deliberate.
- **Over-broad permissions**: `"Action": "*"` on `"Resource": "*"` for an application that needs three actions on one table.
- **Unpatched instances** that nobody owns, especially ones created by hand for a test and forgotten.
- **No logging**: without CloudTrail (API activity) and service logs, you cannot tell afterwards what happened.

## Making it concrete

Write down, per service you use, which of the items above your team owns, and check them automatically. AWS Config rules, Security Hub and IAM Access Analyzer can flag public buckets, unused permissions and missing encryption. Treat the findings like failing tests, not like advice. The rest of this path keeps returning to this line: each building block has settings that only you can get right.
