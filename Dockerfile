# For more information, please refer to https://aka.ms/vscode-docker-python
FROM python:3.12-slim

# Expose the port uvicorn will listen on
EXPOSE 5000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

# Install pip requirements
COPY requirements.txt .
RUN python -m pip install -r requirements.txt

# Set the working directory in the container
WORKDIR /app

# Copy the parent directory (the project folder) into the container
COPY . /app

# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
CMD ["uvicorn", "--host", "0.0.0.0", "--port", "5000", "app.main:app"]
