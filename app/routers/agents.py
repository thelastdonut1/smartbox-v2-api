from typing import Annotated
from fastapi import APIRouter, Path
from fastapi.responses import JSONResponse
from pathlib import Path
from pydantic import BaseModel
from app.utils import is_port_in_use
from app.config import settings
from app.docker_utils import run_container, build_or_get_image, get_existing_container, check_container_status

router = APIRouter(
    prefix="/agents",
    tags=["agents"]
)

class Agent(BaseModel):
    name: str
    port: int


# GET: /agents/list
@router.get("/list")
async def list_agents():
    """
    Lists all agent folders within the data directory.

    """
    # agent_dir = root_dir / 'config'
    agents = [f.name for f in settings.agent_dir.iterdir() if f.is_dir()]
    return JSONResponse(status_code=200, content={"agents": agents})

# GET: /agents/start/{agent}
@router.get("/start/{agent}")
async def start_agent(agent: str):
    """
    Starts the specified agent.
    """
    try:
        container = get_existing_container(agent)
    except Exception as e:
        return JSONResponse(status_code=404, content={"message": f"Agent not found: (Error: {e})"})
    
    status = check_container_status(agent)
    if status == "running":
        return JSONResponse(status_code=200, content={"message": f"Agent {agent} is already running"})
    
    # Start the agent
    try:
        container.start()
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error starting agent: {e}"})
    return JSONResponse(status_code=200, content={"message": f"Agent {agent} started"})

# GET: /agents/stop/{agent}
@router.get("/stop/{agent}")
async def stop_agent(agent: str):
    """
    Stops the specified agent.

    :param agent: The name of the agent to stop.
    :return: A success message if the agent was stopped successfully; otherwise, a failure message.
    """
    try:
        container = get_existing_container(agent)
    except Exception as e:
        return JSONResponse(status_code=404, content={"message": f"Agent not found: (Error: {e})"})

    status = check_container_status(agent)
    if status == "exited":
        return JSONResponse(status_code=200, content={"message": f"Agent {agent} is already stopped"})
    
    # Stop the agent
    try:
        container.stop()
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error stopping agent: {e}"})
    return JSONResponse(status_code=200, content={"message": f"Agent {agent} stopped"})

# GET: /agent/restart?agent=mc1
@router.get("/restart/{agent}")
async def restart_agent(agent: str):
    """
    Restarts the specified agent.

    :param agent: The name of the agent to restart.
    :return: A success message if the agent was restarted successfully; otherwise, a failure message.
    """
    try:
        container = get_existing_container(agent)
    except Exception as e:
        return JSONResponse(status_code=404, content={"message": f"Agent not found: (Error: {e})"})

    # Restart the agent
    try:
        container.restart()
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error restarting agent: {e}"})
    return JSONResponse(status_code=200, content={"message": f"Agent {agent} restarted"})

# POST: /agents/create
# Body = {
#    name: mc1
#    port: 5002
# }
#! The pathing works weird with out this being called inside of a container. The srv/smartbox-api/agents directory is being created in your c drive.
#! Have to test more
@router.post("/create")
def create_agent(agent: Agent):
    """
    Creates a new agent with the specified name and port.

    :param name: The name of the agent to create
    :param port: The port to expose the agent on
    :return: A success message if the agent was created successfully; otherwise, a failure message.
    """
    name = agent.name
    port = agent.port

    # Check if the port is already in use
    if is_port_in_use(port):
        return JSONResponse(status_code=400, content={"message": f"Port {port} is already in use"})
    
    # Build the agent image
    try:
        image = build_or_get_image()
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error building image: {e}"})

    try:
        run_container(image, name, port)
    except Exception as e:
        return JSONResponse(status_code=500, content={"message": f"Error creating agent: {e}"})
    return JSONResponse(status_code=200, content={"message": f"Agent {name} created"})



# DELETE: /agents/delete/{agent}
@router.delete("/delete/{agent}")
async def delete_agent(agent: str):
    """
    Deletes the specified agent folder and its contents from the data directory.

    :param names: The list of agent names to delete
    :return: JSON response indicating 'success' or 'failure' with an error message.
    """
    try:
        container = get_existing_container(agent)
        container.stop()
        container.remove()
    except Exception as e:
        return JSONResponse(status_code=404, content={"message": f"Agent not found: (Error: {e})"})
    return JSONResponse(status_code=200, content={"message": f"Agent {agent} deleted"})


# POST: agents/create/multiple
# Body = {
#    name: Agent
#    port: 5001
#    number: 10
# }
# @router.post("/create/multiple")

