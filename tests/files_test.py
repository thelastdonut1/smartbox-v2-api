from fastapi.testclient import TestClient
from app.main import app

"CHeck if valid inputs give valid responses and invalid inputs give invalid responses."

# TODO: Edit the JSON response to match the expected response

client = TestClient(app)

agent = "MC1"


# Positive test case
def test_show_file_positive():

    response = client.get(f"/files/show/{agent}/config")
    assert response.status_code == 200

    response = client.get(f"/files/show/{agent}/device")
    assert response.status_code == 200

    response = client.get(f"/files/show/{agent}/log")
    assert response.status_code == 200

#! Need to see how the update function works to get the correct directory and file names.
# def test_update_file_positive():
#     response = client.put(f"/files/update", json={"directory": agent, "file": "config"})
#     assert response.status_code == 200
#     assert response.json() == {"message": "File updated successfully."}


def test_delete_file_positive():
    response = client.delete(f"/files/delete/{agent}/config")
    assert response.status_code == 200
    assert response.json() == {"message": "File was successfully deleted"}

    response = client.delete(f"/files/delete/{agent}/device")
    assert response.status_code == 200
    assert response.json() == {"message": "File was successfully deleted"}

    response = client.delete(f"/files/delete/{agent}/log")
    assert response.status_code == 200
    assert response.json() == {"message": "File was successfully deleted"}


def test_list_file_positive():
    response = client.get(f"/files/list/{agent}")
    assert response.status_code == 200


# Negative test cases
def test_show_file_negative():

    response = client.get(f"/files/show/Should_fail/config")
    assert response.status_code == 404
    assert response.json() == {"message": "File not found"}
    
    response = client.get(f"/files/show/Should_fail/device")
    assert response.status_code == 404
    assert response.json() == {"message": "File not found"}

    response = client.get(f"/files/show/Should_fail/log")
    assert response.status_code == 404
    assert response.json() == {"message": "File not found"}

# Positive test case
def test_delete_file_positive():
    response = client.delete(f"/files/delete/{agent}/config")
    assert response.status_code == 200
    assert response.json() == {"message": "File was successfully deleted"}

    response = client.delete(f"/files/delete/{agent}/device")
    assert response.status_code == 200
    assert response.json() == {"message": "File was successfully deleted"}

    response = client.delete(f"/files/delete/{agent}/log")
    assert response.status_code == 200
    assert response.json() == {"message": "File was successfully deleted"}

# Negative test case
def test_delete_file_negative():
    response = client.delete(f"/files/delete/{agent}/config")
    assert response.status_code == 404
    assert response.json() == {"message": "File not found"}

    response = client.delete(f"/files/delete/{agent}/device")
    assert response.status_code == 404
    assert response.json() == {"message": "File not found"}

    response = client.delete(f"/files/delete/{agent}/log")
    assert response.status_code == 404
    assert response.json() == {"message": "File not found"}

# Positive test case
def test_list_file_positive():
    response = client.get(f"/files/list/{agent}")
    assert response.status_code == 200

# Negative test cases
def test_list_file_negative():

    response = client.get(f"/files/list/{agent}")
    assert response.status_code == 200
    
    # response = client.get(f"/files/list/{agent}")
    # assert response.status_code == 404
    # assert response.json() == {"message": "Agent not found"}


# Positive test cases for /update endpoint


# Negative test cases for /update endpoint