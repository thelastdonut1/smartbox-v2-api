import docker
import logging
import uvicorn
from fastapi import FastAPI
from app.routers import files, agents
from app.config import settings


# Create a FastAPI application
app = FastAPI()


# Configure the FastAPI application
app.include_router(agents.router)
app.include_router(files.router)


# Create a Docker client (connection to the Docker daemon)
client = docker.from_env()


# Configure logging
logging.basicConfig(level=logging.INFO)


# Make the agent directory if it does not exist
settings.agent_dir.mkdir(parents=True, exist_ok=True)  # Create the agent directory if it does not exist


# Run the FastAPI application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
