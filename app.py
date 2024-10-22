from flask import Flask, render_template, url_for, request, jsonify, session, redirect
from requests_oauthlib import OAuth2Session
from datetime import timedelta
from dotenv import load_dotenv
import os
import ee
app = Flask(__name__)
load_dotenv()
os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'
app.secret_key = app.secret_key = os.urandom(24)
client_id = os.getenv("GOOGLE_CLIENT_ID")
client_secret = os.getenv("GOOGLE_CLIENT_SECRET")
redirect_uri = "http://localhost:5000/auth/callback"
authorization_base_url = 'https://accounts.google.com/o/oauth2/auth'
token_url = 'https://accounts.google.com/o/oauth2/token'
userinfo_url = 'https://www.googleapis.com/oauth2/v1/userinfo'
app.config['SESSION_PERMANENT'] = False
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(minutes=1)

def get_google_auth(state=None, token=None):
    """Helper function to get a Google OAuth session"""
    if token:
        return OAuth2Session(client_id, token=token)
    if state:
        return OAuth2Session(client_id, state=state, redirect_uri=redirect_uri)
    return OAuth2Session(client_id, redirect_uri=redirect_uri, scope=["openid", "email", "profile"])

@app.route('/')
def index():
    user = session.get('user')
    if not user:
        return redirect(url_for('login'))
    return render_template('index.html', user=user)

@app.route('/login')
def login():
    """Login route to start the OAuth flow"""
    google = get_google_auth()
    authorization_url, state = google.authorization_url(authorization_base_url, access_type='offline')
    
    session['oauth_state'] = state
    return redirect(authorization_url)


@app.route('/auth/callback')
def auth_callback():
    if 'error' in request.args:
        return f"Error: {request.args['error']}", 400
    if 'oauth_state' not in session:
        return redirect(url_for('login'))

    google = get_google_auth(state=session['oauth_state'])
    token = google.fetch_token(token_url, client_secret=client_secret, authorization_response=request.url)
    
    session['oauth_token'] = token

    google = get_google_auth(token=token)
    resp = google.get(userinfo_url)
    user_info = resp.json()
    session['user'] = user_info
    session.permanent = False
    return redirect(url_for('index'))


@app.route('/globe')
def globe():
    return render_template('globe.html')

@app.route('/region-data')
def regiondata():
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    return render_template('region_data.html', latitude=lat, longitude=lon)

if __name__ == '__main__':
    app.run(debug=True)