from fastapi import APIRouter

router = APIRouter(
    prefix="/agents",
    tags=["agents"]
)

# GET: /agents/list
# @router.get("/list")

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

