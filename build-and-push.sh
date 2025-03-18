#!/bin/bash

# Required variables (can be modified in this script or passed as parameters)
AWS_REGION="ap-south-1"        # AWS region where ECR repository exists
ECR_REPO_NAME="prod/kafka-pub" # Name of the ECR repository
IMAGE_TAG="latest"             # Image tag to use
AWS_PROFILE="zm"          # AWS profile to use

# Additional optional variables
DOCKERFILE_PATH="./Dockerfile"
BUILD_CONTEXT="."

# Parse command line arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --region)
      AWS_REGION="$2"
      shift 2
      ;;
    --repo)
      ECR_REPO_NAME="$2"
      shift 2
      ;;
    --tag)
      IMAGE_TAG="$2"
      shift 2
      ;;
    --profile)
      AWS_PROFILE="$2"
      shift 2
      ;;
    --dockerfile)
      DOCKERFILE_PATH="$2"
      shift 2
      ;;
    --context)
      BUILD_CONTEXT="$2"
      shift 2
      ;;
    *)
      echo "Unknown option: $1"
      exit 1
      ;;
  esac
done

# Print configuration
echo "Building and pushing Docker image with the following configuration:"
echo "AWS Region: $AWS_REGION"
echo "ECR Repository: $ECR_REPO_NAME"
echo "Image Tag: $IMAGE_TAG"
echo "AWS Profile: $AWS_PROFILE"
echo "Dockerfile Path: $DOCKERFILE_PATH"
echo "Build Context: $BUILD_CONTEXT"

# Configure AWS CLI with the specified profile
echo "Configuring AWS CLI with profile: $AWS_PROFILE"
export AWS_PROFILE=$AWS_PROFILE

# Get AWS account ID
echo "Getting AWS account ID..."
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

if [ $? -ne 0 ]; then
  echo "Error: Failed to get AWS account ID. Please check your AWS credentials."
  exit 1
fi

# ECR repository URL
ECR_REPO_URL="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com/$ECR_REPO_NAME"

# Check if ECR repository exists, create if it doesn't
echo "Checking if ECR repository exists: $ECR_REPO_NAME"
aws ecr describe-repositories --repository-names $ECR_REPO_NAME --region $AWS_REGION >/dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "Creating ECR repository: $ECR_REPO_NAME"
  aws ecr create-repository --repository-name $ECR_REPO_NAME --region $AWS_REGION
  if [ $? -ne 0 ]; then
    echo "Error: Failed to create ECR repository."
    exit 1
  fi
fi

# Log in to ECR
echo "Logging in to ECR..."
aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin $ECR_REPO_URL

if [ $? -ne 0 ]; then
  echo "Error: Failed to log in to ECR."
  exit 1
fi

# Build Docker image
echo "Building Docker image: $ECR_REPO_URL:$IMAGE_TAG"
docker build --platform linux/amd64 -t $ECR_REPO_URL:$IMAGE_TAG -f $DOCKERFILE_PATH $BUILD_CONTEXT

if [ $? -ne 0 ]; then
  echo "Error: Failed to build Docker image."
  exit 1
fi

# Push Docker image to ECR
echo "Pushing Docker image to ECR: $ECR_REPO_URL:$IMAGE_TAG"
docker push $ECR_REPO_URL:$IMAGE_TAG

if [ $? -ne 0 ]; then
  echo "Error: Failed to push Docker image to ECR."
  exit 1
fi

echo "Successfully built and pushed Docker image: $ECR_REPO_URL:$IMAGE_TAG" 