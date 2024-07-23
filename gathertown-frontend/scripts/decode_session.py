import os
import pickle

# Path to your session file
session_file_path = '/home/equansa00/Downloads/GatherTown/gathertown-frontend/scripts/flask_session/2029240f6d1128be89ddc32729463129'

# Read the session data from the file
with open(session_file_path, 'rb') as f:
    session_data = f.read()

print("Raw session data:", session_data)

# Attempt to decode the session data using pickle
try:
    data = pickle.loads(session_data)
    print("Decoded session data:", data)
except pickle.UnpicklingError as e:
    print("UnpicklingError:", e)
except Exception as e:
    print("Error:", e)
