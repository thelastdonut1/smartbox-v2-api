from fastapi.testclient import TestClient
from app.main import app
import logging

"CHeck if valid inputs give valid responses and invalid inputs give invalid responses."

client = TestClient(app)



# Positive test cases
def test_create_agent_positive():

    response = client.post("/agents/create", json={"name": "TEST_AGENT", "port": 5010})
    assert response.status_code == 200
    assert response.json() == {"message": "Agent TEST_AGENT created"}

    response = client.post("/agents/create", json={"name": "TEST_AGENT_2", "port": 5011})
    assert response.status_code == 200
    assert response.json() == {"message": "Agent TEST_AGENT_2 created"}


#! Add a response.json() to test the amount of agents in the list
def test_list_agents_positive():

    response = client.get("/agents/list")
    assert response.status_code == 200


def test_start_agent_positive():

    response = client.get("/agents/start/TEST_AGENT")
    response.status_code == 200
    assert response.json() == {"message": "Agent TEST_AGENT started"} or {"message": "Agent TEST_AGENT is already running"}

def test_stop_agent_positive():

    response = client.get("/agents/stop/TEST_AGENT")
    response.status_code == 200
    assert response.json() == {"message": "Agent TEST_AGENT stopped"} or {"message": "Agent TEST_AGENT is already stopped"}


def test_delete_agent_positive():
    response = client.delete("/agents/delete/TEST_AGENT")
    response.status_code == 200
    assert response.json() == {"message": "Agent TEST_AGENT deleted"}

    response = client.delete("/agents/delete/TEST_AGENT_2")
    response.status_code == 200
    assert response.json() == {"message": "Agent TEST_AGENT_2 deleted"}


# Negative test cases
def test_create_agent_negative():

    response = client.post("/agents/create", json={"name": "Should_fail", "port": 5000})
    if response.status_code == 400:
        assert response.json() == {"message": "Port 5000 is already in use"}
    if response.status_code == 500:
        assert logging.error(f"Error while creating building the image")


#! Add a response.json() to test the amount of agents in the list
# def test_list_agents_negative():
#     response = client.get("/agents/list")
#     assert response.status_code == 200


def test_start_agent_negative():
    response = client.get("/agents/start/Should_fail")
    response.status_code == 404
    assert response.json() == {"message": "Agent not found: (Error: Agent 'Should_fail' not found)"}


def test_stop_agent_negative():
    response = client.get("/agents/stop/Should_fail")
    response.status_code == 404
    assert response.json() == {"message": "Agent not found: (Error: Agent 'Should_fail' not found)"}



def test_delete_agent_negative():
    response = client.delete("/agents/delete/Should_fail")
    response.status_code == 404
    assert response.json() == {"message": "Agent not found: (Error: Agent 'Should_fail' not found)"}

