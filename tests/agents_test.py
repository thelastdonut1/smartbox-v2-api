from fastapi.testclient import TestClient
from app.main import app

"CHeck if valid inputs give valid responses and invalid inputs give invalid responses."

client = TestClient(app)

def test_create_agent():
    response = client.post("/agents/create", json={"name": "TEST_AGENT", "port": 5010})
    assert response.status_code == 200
    assert response.json() == {"message": "Agent TEST_AGENT created"}

    response = client.post("/agents/create", json={"name": "TEST_AGENT", "port": 5010})
    assert response.status_code == 500

    response = client.post("/agents/create", json={"name": "TEST_AGENT", "port": 5010})
    assert response.status_code == 400
    assert response.json() == {"message": "Port already in use"}

    response = client.post("/agents/create", json={"name": "TEST_AGENT_2", "port": 5011})
    assert response.status_code == 200
    assert response.json() == {"message": "Agent TEST_AGENT_2 created"}

#! Add a response.json() to test the amount of agents in the list
def test_list_agents():
    response = client.get("/agents/list")
    assert response.status_code == 200


def test_start_agent():
    response = client.get("/agents/start/TEST_AGENT")
    if response.status_code == 404:
        assert response.json() == {"message": "Agent not found: (Error: Agent 'TEST_AGENT' not found)"}
    
    if response.status_code == 200:
        assert response.json() == {"message": "Agent TEST_AGENT started"} or {"message": "Agent TEST_AGENT is already running"}

def test_stop_agent():
    response = client.get("/agents/stop/TEST_AGENT")
    if response.status_code == 404:
        assert response.json() == {"message": "Agent not found: (Error: Agent 'TEST_AGENT' not found)"}
    
    if response.status_code == 200:
        assert response.json() == {"message": "Agent TEST_AGENT stopped"} or {"message": "Agent TEST_AGENT is already stopped"}


def test_delete_agent():
    response = client.delete("/agents/delete/TEST_AGENT")
    if response.status_code == 404:
        assert response.json() == {"message": "Agent not found: (Error: Agent 'TEST_AGENT' not found)"}
    
    if response.status_code == 200:
        assert response.json() == {"message": "Agent TEST_AGENT deleted"}

    response = client.delete("/agents/delete/TEST_AGENT_2")
    if response.status_code == 404:
        assert response.json() == {"message": "Agent not found: (Error: Agent 'TEST_AGENT_2' not found)"}
    
    if response.status_code == 200:
        assert response.json() == {"message": "Agent TEST_AGENT_2 deleted"}