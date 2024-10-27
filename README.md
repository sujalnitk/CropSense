# CropSense
Harness AI and Data to Empower Communities, Farmers, and Individuals

[This is the project for the 'Redpanda AI Hackathon']

# How to Run it Locally on your device

First, clone the repository

```bash
git clone <repo-url>
```

Then locate to the project folder & install the required libraries

```bash
pip install -r requirements.txt
```

Afterwards locate to your .env file & replace the keys according to your Google Cloud Console project.

```.env
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GOOGLE_DISCOVERY_URL=""
```

Finally, run your python - flask application

```bash
python main.py
```

# For Testing ndvi and connecting to redpanda for streaming

first create a redpanda topic make sure you have installed redpanda cli

```bash
rpk topic create ndvi-values
```

then run it in the terminal 

```bash
python ndvi_streamer.py
```

# How to connect gke to redpanda 

first install minikube 

Then using gcolud cli paste in the terminal 
```bash
gcloud container clusters get-credentials redpanda-cluster --zone us-central1-c

```
Verify the Connection: Check if your kubectl is correctly configured to work with the GKE cluster by listing the nodes:

```bash
kubectl get nodes

```

