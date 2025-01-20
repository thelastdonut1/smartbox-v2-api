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
from app.docker_utils import make_multiple_containers

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


# create multiple containers
# This checks to see if the mtconnect/agent image is present already on the smartbox and if it is, it does not make 10 agents
try:
    if client.images.get("mtconnect/agent"):
            logging.info(f"The MTconnect agent image already exists. Assuming agents already exist and skipping.")
except docker.errors.ImageNotFound:
            logging.info("MTConnect agent image not found. Proceeding with function...")
            make_multiple_containers(agent_name="MC", image="mtconnect/agent", port=5000)

# Run the FastAPI application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
