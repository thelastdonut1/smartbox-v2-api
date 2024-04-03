from fastapi import FastAPI
import uvicorn

from app.routers import files, agents

app = FastAPI()

app.include_router(agents.router)
app.include_router(files.router)

# Run the FastAPI application
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
