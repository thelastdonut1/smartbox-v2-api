from fastapi import APIRouter
from fastapi.responses import JSONResponse
from app.config import settings


router = APIRouter(
    prefix="/agents",
    tags=["agents"]
)


# GET: /agents/list
@router.get("/list")
async def list_agents():
    """
    Lists all agent folders within the data directory.

    :return: JSON response with a list of agent folders or a failure message.
    """
    # agent_dir = root_dir / 'config'
    agents = [f.name for f in settings.agent_dir.iterdir() if f.is_dir()]
    return JSONResponse(status_code=200, content={"agents": agents})

# GET: /agents/start?agent=mc1
# @router.get("/start")

# GET: /agents/stop?agent=mc1
# @router.get("/stop")

# GET: /agent/restart?agent=mc1
#! Implement the restart agent endpoint

# POST: /agents/create
# Body = {
#    name: mc1
#    port: 5002
# }
# @router.post("/create")

# DELETE: /agents/delete
# Body = {
#   "names": ["mc1"] OR ["mc1", "mc2", "mc3"]
# }
# Timeout will occur when deleting 2+ agents. Will fix when migrating to async (FastApi)
# @router.delete("/agent/delete")

# POST: agents/create/multiple
# Body = {
#    name: Agent
#    port: 5001
#    number: 10
# }
# @router.post("/create/multiple")

