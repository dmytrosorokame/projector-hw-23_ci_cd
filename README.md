# Projector HSA Home work #23: Continuous Integration and Deployment

## Todo:

1. CI/CD for Autocomplete with Elasticsearch App

## Results:

1. Created [ci.yaml](.github/workflows/ci.yaml) GitHub Action Workflow
2. Created [cd.yaml](.github/workflows/cd.yaml) GitHub Action Workflow
3. Created EC2 instance and setup Docker, Docker Compose there
4. Created [rebuild.sh](rebuild.sh) script to rebuild and start the containers
5. Added SSH_PRIVATE_KEY, SSH_HOST, SSH_USERNAME to GitHub Secrets

## Continues Integration:

Job is triggered on pull request.

Steps:

- pulls the latest code
- installs dependencies
- runs lint
- runs tests

## Continues Deployment:

Job is triggered on push to main branch.

Steps:

- pulls the latest code
- connects to EC2 instance
- runs rebuild.sh script on it, which:
  - pulls the latest code
  - builds the project with docker compose
  - starts the containers
