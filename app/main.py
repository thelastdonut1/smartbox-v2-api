from fastapi import FastAPI
import uvicorn
import docker
import logging
from pathlib import Path
from routers import files, agents

# Create a FastAPI application
app = FastAPI()

# Configure the FastAPI application
app.include_router(agents.router)
app.include_router(files.router)

# Create a Docker client (connection to the Docker daemon)
# client = docker.from_env()

agent_dir = Path("/srv/smartbox-api/agents")  # Path to the agent directory
agent_dir.mkdir(parents=True, exist_ok=True)  # Create the agent directory if it does not exist

# Configure logging
logging.basicConfig(level=logging.DEBUG)


# Run the FastAPI application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
