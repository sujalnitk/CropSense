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
