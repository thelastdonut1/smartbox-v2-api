import shutil
import docker
import logging
import uvicorn
from fastapi import FastAPI
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.routers import files, agents
from app.config import settings
from app.docker_utils import make_ten_agents

# Initialize the Limiter
limiter = Limiter(key_func=get_remote_address)

# Create a FastAPI application
app = FastAPI()

# Attach the rate limiter to the FastAPI application
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure the FastAPI application
app.include_router(agents.router)
app.include_router(files.router)


# Create a Docker client (connection to the Docker daemon)
client = docker.from_env()


# Configure logging
logging.basicConfig(level=logging.INFO)


# Make the agent directory if it does not exist
settings.agent_dir.mkdir(parents=True, exist_ok=True)  # Create the agent directory if it does not exist

make_ten_agents(agent_name="MC", port=5000, image="mtconnect/agent")


# Run the FastAPI application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
