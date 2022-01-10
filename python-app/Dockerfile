FROM python:3.9

EXPOSE 8000

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

WORKDIR /python-app
COPY . /python-app

# Creates a non-root user with an explicit UID and adds permission to access the /recommender folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
RUN adduser -u 5678 --disabled-password --gecos "" appuser && chown -R appuser /python-app
USER appuser

# CMD ["uvicorn", "api:app", "--host", "0.0.0.0"]
CMD ["gunicorn", "api:app", "--workers", "1", "--worker-class", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000"]