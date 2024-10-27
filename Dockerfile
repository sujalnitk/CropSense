FROM python:3.12-slim

# Install the Redpanda client library
RUN pip install confluent-kafka

# Copy the Python script into the container
COPY redpanda-test.py /app/redpanda-test.py

# Set the working directory
WORKDIR /app

# Run the Python script
CMD ["python", "redpanda-test.py"]
